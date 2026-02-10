package com.bincms.domain.comment.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.comment.dto.CommentCreateRequest;
import com.bincms.domain.comment.dto.CommentDeleteRequest;
import com.bincms.domain.comment.dto.CommentResponse;
import com.bincms.domain.comment.dto.CommentUpdateRequest;
import com.bincms.domain.comment.entity.Comment;
import com.bincms.domain.comment.repository.CommentRepository;
import com.bincms.domain.post.entity.Post;
import com.bincms.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 댓글 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 댓글 생성
     */
    @Transactional
    public CommentResponse createComment(CommentCreateRequest request) {
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND, "게시글을 찾을 수 없습니다"));

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "부모 댓글을 찾을 수 없습니다"));
        }

        Comment comment = Comment.builder()
                .post(post)
                .parent(parent)
                .authorName(request.getAuthorName())
                .password(passwordEncoder.encode(request.getPassword()))
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return CommentResponse.from(savedComment);
    }

    /**
     * 게시글의 댓글 목록 조회 (대댓글 포함, 트리 구조)
     */
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        List<Comment> rootComments = commentRepository.findRootCommentsByPostId(postId);

        return rootComments.stream()
                .map(root -> {
                    List<CommentResponse> replies = commentRepository.findRepliesByParentId(root.getId())
                            .stream()
                            .map(CommentResponse::from)
                            .collect(Collectors.toList());
                    return CommentResponse.from(root, replies);
                })
                .collect(Collectors.toList());
    }

    /**
     * 게시글의 댓글 수
     */
    public long getCommentCount(Long postId) {
        return commentRepository.countByPostId(postId);
    }

    /**
     * 댓글 수정
     */
    @Transactional
    public CommentResponse updateComment(Long id, CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "댓글을 찾을 수 없습니다"));

        if (!passwordEncoder.matches(request.getPassword(), comment.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD, "비밀번호가 일치하지 않습니다");
        }

        comment.update(request.getContent());
        return CommentResponse.from(comment);
    }

    /**
     * 댓글 삭제 (비활성화)
     */
    @Transactional
    public void deleteComment(Long id, CommentDeleteRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "댓글을 찾을 수 없습니다"));

        if (!passwordEncoder.matches(request.getPassword(), comment.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD, "비밀번호가 일치하지 않습니다");
        }

        comment.deactivate();
    }

    /**
     * 관리자 댓글 삭제 (비밀번호 확인 없이)
     */
    @Transactional
    public void deleteCommentByAdmin(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "댓글을 찾을 수 없습니다"));
        comment.deactivate();
    }
}
