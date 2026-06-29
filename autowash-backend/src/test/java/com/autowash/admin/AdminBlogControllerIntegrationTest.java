package com.autowash.admin;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.autowash.entity.User;
import com.autowash.entity.enums.UserRole;
import com.autowash.repository.UserRepository;
import com.autowash.shared.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminBlogControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void adminCanCreateCategoryAndArticleAndListThem() throws Exception {
        String categoryId = createCategory("Tips", "tips");

        mockMvc.perform(post("/api/v1/admin/blog/articles")
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "categoryId": "%s",
                                  "title": "Keep your paint fresh",
                                  "slug": "keep-your-paint-fresh",
                                  "thumbnailUrl": "https://cdn.example.com/blog/thumb-1.jpg",
                                  "excerpt": "Simple maintenance habits",
                                  "content": "Full article content",
                                  "status": "DRAFT"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.slug").value("keep-your-paint-fresh"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.category.categoryId").value(categoryId));

        mockMvc.perform(get("/api/v1/admin/blog/articles").with(authenticatedAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].slug").value("keep-your-paint-fresh"))
                .andExpect(jsonPath("$.data[0].status").value("DRAFT"));
    }

    @Test
    void adminCanPublishDraftArticleAndPublicApiCanReadIt() throws Exception {
        String categoryId = createCategory("Guides", "guides");

        MvcResult createResult = mockMvc.perform(post("/api/v1/admin/blog/articles")
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "categoryId": "%s",
                                  "title": "Engine bay cleaning",
                                  "slug": "engine-bay-cleaning",
                                  "thumbnailUrl": "https://cdn.example.com/blog/thumb-2.jpg",
                                  "excerpt": "Protect sensitive parts",
                                  "content": "Engine cleaning content",
                                  "status": "DRAFT"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andReturn();

        String articleId = readJson(createResult).path("data").path("articleId").asText();

        mockMvc.perform(put("/api/v1/admin/blog/articles/{articleId}", articleId)
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "categoryId": "%s",
                                  "title": "Engine bay cleaning",
                                  "slug": "engine-bay-cleaning",
                                  "thumbnailUrl": "https://cdn.example.com/blog/thumb-2.jpg",
                                  "excerpt": "Protect sensitive parts",
                                  "content": "Engine cleaning content",
                                  "status": "PUBLISHED"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.data.publishedAt").isNotEmpty());

        mockMvc.perform(get("/api/v1/blog/articles/{slug}", "engine-bay-cleaning"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.slug").value("engine-bay-cleaning"))
                .andExpect(jsonPath("$.data.content").value("Engine cleaning content"));
    }

    @Test
    void adminCanDeleteArticleAndCategory() throws Exception {
        String categoryId = createCategory("Stories", "stories");

        MvcResult createResult = mockMvc.perform(post("/api/v1/admin/blog/articles")
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "categoryId": "%s",
                                  "title": "Customer story",
                                  "slug": "customer-story",
                                  "thumbnailUrl": "https://cdn.example.com/blog/thumb-3.jpg",
                                  "excerpt": "Story excerpt",
                                  "content": "Story content",
                                  "status": "DRAFT"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andReturn();

        String articleId = readJson(createResult).path("data").path("articleId").asText();

        mockMvc.perform(delete("/api/v1/admin/blog/articles/{articleId}", articleId)
                        .with(authenticatedAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.articleId").value(articleId));

        mockMvc.perform(delete("/api/v1/admin/blog/categories/{categoryId}", categoryId)
                        .with(authenticatedAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.categoryId").value(categoryId));
    }

    private String createCategory(String name, String slug) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/admin/blog/categories")
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "%s",
                                  "slug": "%s",
                                  "description": "%s description"
                                }
                                """.formatted(name, slug, name)))
                .andExpect(status().isCreated())
                .andReturn();
        return readJson(result).path("data").path("categoryId").asText();
    }

    private RequestPostProcessor authenticatedAdmin() {
        User admin = new User("Blog Admin", uniquePhone("0975"), "blog-admin-" + java.util.UUID.randomUUID() + "@example.com", "hash");
        admin.activate();
        ReflectionTestUtils.setField(admin, "role", UserRole.ADMIN);
        userRepository.saveAndFlush(admin);
        UserPrincipal principal = new UserPrincipal(admin);
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities());
        return authentication(token);
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String uniquePhone(String prefix) {
        String digits = java.util.UUID.randomUUID().toString().replaceAll("\\D", "");
        while (digits.length() < 6) {
            digits += "0";
        }
        return prefix + digits.substring(0, 6);
    }
}
