package com.bincms.seo;

import com.bincms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * /sitemap.xml: 비로그인 200, 공개 라우트 + 사용 중인 인테리어 상세 URL. 비활성 글은 제외.
 * 기대값 정본: docs/30-dev/guides/features/40-인테리어-갤러리.md, 00-공통.md
 */
class SitemapTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("sitemap.xml 은 익명 200, 정적 라우트와 활성 인테리어 상세를 담는다")
    void sitemapListsPublicRoutesAndInteriors() throws Exception {
        String admin = adminBearer();
        long visible = create(admin, "sitemap-visible-" + System.nanoTime());
        long hidden = create(admin, "sitemap-hidden-" + System.nanoTime());
        mockMvc.perform(delete("/api/v1/admin/interiors/" + hidden).header("Authorization", admin))
                .andExpect(status().isOk());

        String xml = mockMvc.perform(get("/sitemap.xml"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(xml).startsWith("<?xml");
        assertThat(xml).contains("<urlset");
        assertThat(xml).contains("<loc>http://localhost:3000/user</loc>");
        assertThat(xml).contains("<loc>http://localhost:3000/user/interior/onsite</loc>");
        assertThat(xml).contains("<loc>http://localhost:3000/user/inquiry</loc>");
        assertThat(xml).contains("/user/interior/story/" + visible + "</loc>");
        assertThat(xml).doesNotContain("/user/interior/story/" + hidden + "</loc>");
        assertThat(xml).doesNotContain("/admin");
    }

    private long create(String admin, String title) throws Exception {
        String body = mockMvc.perform(post("/api/v1/admin/interiors").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"STORY\",\"title\":\"" + title + "\",\"content\":\"<p>x</p>\"}"))
                .andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).path("data").path("id").asLong();
    }
}
