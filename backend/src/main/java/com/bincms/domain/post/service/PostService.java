package com.bincms.domain.post.service;

import com.bincms.common.dto.PageResponse;
import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.board.entity.Board;
import com.bincms.domain.board.repository.BoardRepository;
import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.repository.MemberRepository;
import com.bincms.domain.post.dto.PostCreateRequest;
import com.bincms.domain.post.dto.PostResponse;
import com.bincms.domain.post.dto.PostUpdateRequest;
import com.bincms.domain.post.dto.UserPostCreateRequest;
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
    private final MemberRepository memberRepository;
    
    /**
     * REG_NO(회원PK 문자열)로 Member를 조회하여 반환. 없으면 null.
     */
    private Member findMemberByRegNo(String regNo) {
        if (regNo == null || regNo.isBlank()) {
            return null;
        }
        try {
            Long memberId = Long.parseLong(regNo);
            return memberRepository.findById(memberId).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * Post → PostResponse 변환 (작성자 정보 포함)
     */
    private PostResponse toResponse(Post post) {
        Member author = findMemberByRegNo(post.getRegNo());
        return PostResponse.from(post, author);
    }
    
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
        return toResponse(savedPost);
    }
    
    /**
     * 게시판별 게시글 목록 조회
     */
    public PageResponse<PostResponse> getPostsByBoard(Long boardId, Pageable pageable) {
        Page<Post> posts = postRepository.findByBoardIdAndUseYnOrderByNoticeYnDescIdDesc(
                boardId, "Y", pageable);
        
        return PageResponse.of(posts.map(this::toResponse));
    }
    
    /**
     * 전체 게시글 목록 조회
     */
    public PageResponse<PostResponse> getAllPosts(Pageable pageable) {
        Page<Post> posts = postRepository.findByUseYnOrderByIdDesc("Y", pageable);
        return PageResponse.of(posts.map(this::toResponse));
    }
    
    /**
     * 게시글 검색
     */
    public PageResponse<PostResponse> searchPosts(Long boardId, String keyword, Pageable pageable) {
        Page<Post> posts = postRepository.searchByBoardIdAndKeyword(
                boardId, "Y", keyword, pageable);
        
        return PageResponse.of(posts.map(this::toResponse));
    }
    
    /**
     * 게시글 상세 조회
     */
    @Transactional
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시글을 찾을 수 없습니다"));
        
        post.increaseViewCount();
        return toResponse(post);
    }
    
    /**
     * 게시글 수정
     */
    @Transactional
    public PostResponse updatePost(Long id, PostUpdateRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시글을 찾을 수 없습니다"));
        
        post.update(request.getTitle(), request.getContent(), request.getNoticeYn());
        return toResponse(post);
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
    
    // ==================== 사용자용 게시글 CRUD ====================
    
    /**
     * 사용자 게시글 생성 (로그인 필수)
     * - AuditorAware가 REG_NO에 회원 PK를 자동 세팅
     */
    @Transactional
    public PostResponse createUserPost(String loginId, String boardCode, UserPostCreateRequest request) {
        // loginId 유효성 검증
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        Board board = boardRepository.findByBoardCode(boardCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시판을 찾을 수 없습니다"));
        
        Post post = Post.builder()
                .board(board)
                .title(request.getTitle())
                .content(request.getContent())
                .noticeYn("N")  // 사용자는 공지글 작성 불가
                .build();
        
        Post savedPost = postRepository.save(post);
        return PostResponse.from(savedPost, member);
    }
    
    /**
     * 사용자 게시글 수정 (본인만)
     * - REG_NO(회원PK)와 현재 로그인 사용자의 PK를 비교하여 본인 확인
     */
    @Transactional
    public PostResponse updateUserPost(String loginId, Long postId, PostUpdateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시글을 찾을 수 없습니다"));
        
        // 본인 확인: REG_NO(회원PK) 비교
        Member currentMember = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        if (!String.valueOf(currentMember.getId()).equals(post.getRegNo())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인이 작성한 글만 수정할 수 있습니다");
        }
        
        post.update(request.getTitle(), request.getContent(), post.getNoticeYn());
        return PostResponse.from(post, currentMember);
    }
    
    /**
     * 사용자 게시글 삭제 (본인만, 비활성화)
     * - REG_NO(회원PK)와 현재 로그인 사용자의 PK를 비교하여 본인 확인
     */
    @Transactional
    public void deleteUserPost(String loginId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시글을 찾을 수 없습니다"));
        
        // 본인 확인: REG_NO(회원PK) 비교
        Member currentMember = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        if (!String.valueOf(currentMember.getId()).equals(post.getRegNo())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인이 작성한 글만 삭제할 수 있습니다");
        }
        
        post.deactivate();
    }
}
