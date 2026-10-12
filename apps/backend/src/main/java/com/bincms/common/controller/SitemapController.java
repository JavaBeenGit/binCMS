package com.bincms.common.controller;

import com.bincms.domain.interior.entity.Interior;
import com.bincms.domain.interior.entity.InteriorCategory;
import com.bincms.domain.interior.repository.InteriorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * /sitemap.xml — 검색엔진용. 공개 라우트 + 사용 중인 인테리어 상세(/user/interior/{slug}/{id}).
 * 베이스 URL 은 app.site.base-url (운영: SITE_BASE_URL). 프론트 robots.txt 가 이 경로를 가리킨다.
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

    private static final List<String> STATIC_PATHS = List.of(
            "/user", "/user/notice", "/user/faq", "/user/free",
            "/user/interior/onsite", "/user/interior/self-tip", "/user/interior/story",
            "/user/inquiry");

    private static final Map<InteriorCategory, String> SLUG = Map.of(
            InteriorCategory.ONSITE, "onsite",
            InteriorCategory.SELF_TIP, "self-tip",
            InteriorCategory.STORY, "story");

    private final InteriorRepository interiorRepository;

    @Value("${app.site.base-url:http://localhost:3000}")
    private String baseUrl;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE + ";charset=UTF-8")
    @Transactional(readOnly = true)
    public String sitemap() {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String path : STATIC_PATHS) {
            sb.append("  <url><loc>").append(base).append(path).append("</loc></url>\n");
        }
        for (Interior interior : interiorRepository.findByUseYn("Y")) {
            String slug = SLUG.getOrDefault(interior.getCategory(), "onsite");
            sb.append("  <url><loc>").append(base).append("/user/interior/").append(slug).append('/')
                    .append(interior.getId()).append("</loc>");
            if (interior.getModDt() != null) {
                sb.append("<lastmod>").append(interior.getModDt().format(DateTimeFormatter.ISO_LOCAL_DATE)).append("</lastmod>");
            }
            sb.append("</url>\n");
        }
        sb.append("</urlset>\n");
        return sb.toString();
    }
}
