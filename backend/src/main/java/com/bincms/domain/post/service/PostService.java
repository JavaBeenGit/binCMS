package com.bincms.domain.post.service;

import com.bincms.common.dto.PageResponse;
import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.board.entity.Board;
import com.bincms.domain.board.repository.BoardRepository;
import com.bincms.domain.post.dto.PostCreateRequest;
import com.bincms.domain.post.dto.PostResponse;
import com.bincms.domain.post.dto.PostUpdateRequest;
import com.bincms.domain.post.entity.Post;
import com.bincms.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 게시글 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
    
    private final PostRepository postRepository;
    private final BoardRepository boardRepository;
    
    /**
     * 게시글 생성
     */
    @Transactional
    public PostResponse createPost(PostCreateRequest request) {
        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시판을 찾을 수 없습니다"));
        
        Post post = Post.builder()
                .board(board)
                .title(request.getTitle())
                .content(request.getContent())
                .noticeYn(request.getNoticeYn())
                .build();
        
        Post savedPost = postRepository.save(post);
        return PostResponse.from(savedPost);
    }
    
    /**
     * 게시판별 게시글 목록 조회
     */
    public PageResponse<PostResponse> getPostsByBoard(Long boardId, Pageable pageable) {
        Page<Post> posts = postRepository.findByBoardIdAndUseYnOrderByNoticeYnDescIdDesc(
                boardId, "Y", pageable);
        
        return PageResponse.of(posts.map(PostResponse::from));
    }
    
    /**
     * 전체 게시글 목록 조회
     */
    public PageResponse<PostResponse> getAllPosts(Pageable pageable) {
        Page<Post> posts = postRepository.findByUseYnOrderByIdDesc("Y", pageable);
        return PageResponse.of(posts.map(PostResponse::from));
    }
    
    /**
     * 게시글 검색
     */
    public PageResponse<PostResponse> searchPosts(Long boardId, String keyword, Pageable pageable) {
        Page<Post> posts = postRepository.searchByBoardIdAndKeyword(
                boardId, "Y", keyword, pageable);
        
        return PageResponse.of(posts.map(PostResponse::from));
    }
    
    /**
     * 게시글 상세 조회
     */
    @Transactional
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시글을 찾을 수 없습니다"));
        
        post.increaseViewCount();
        return PostResponse.from(post);
    }
    
    /**
     * 게시글 수정
     */
    @Transactional
    public PostResponse updatePost(Long id, PostUpdateRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시글을 찾을 수 없습니다"));
        
        post.update(request.getTitle(), request.getContent(), request.getNoticeYn());
        return PostResponse.from(post);
    }
    
    /**
     * 게시글 삭제 (비활성화)
     */
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시글을 찾을 수 없습니다"));
        
        post.deactivate();
    }
}
