package com.autowash.blog;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BlogControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void listPublishedArticlesReturnsOnlyPublishedItems() throws Exception {
        UUID authorId = insertAuthor("blog-public-author-1@example.com");
        UUID categoryId = insertCategory("Car Care", "car-care");

        insertArticle(categoryId, authorId, "Hidden draft", "hidden-draft", "DRAFT", null, "Draft content");
        insertArticle(categoryId, authorId, "Summer wash tips", "summer-wash-tips", "PUBLISHED", Instant.parse("2026-06-10T10:00:00Z"), "Tip content");
        insertArticle(categoryId, authorId, "Rainy season checklist", "rainy-season-checklist", "PUBLISHED", Instant.parse("2026-06-12T10:00:00Z"), "Checklist content");

        mockMvc.perform(get("/api/v1/blog/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].slug", hasItem("rainy-season-checklist")))
                .andExpect(jsonPath("$.data[*].slug", hasItem("summer-wash-tips")))
                .andExpect(jsonPath("$.data[*].slug", not(hasItem("hidden-draft"))));
    }

    @Test
    void getPublishedArticleBySlugReturnsDetailAndHidesDrafts() throws Exception {
        UUID authorId = insertAuthor("blog-public-author-2@example.com");
        UUID categoryId = insertCategory("Maintenance", "maintenance");

        insertArticle(categoryId, authorId, "Published article", "published-article", "PUBLISHED", Instant.parse("2026-06-15T10:00:00Z"), "Published body");
        insertArticle(categoryId, authorId, "Draft article", "draft-article", "DRAFT", null, "Draft body");

        mockMvc.perform(get("/api/v1/blog/articles/{slug}", "published-article"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.slug").value("published-article"))
                .andExpect(jsonPath("$.data.title").value("Published article"))
                .andExpect(jsonPath("$.data.content").value("Published body"))
                .andExpect(jsonPath("$.data.category.slug").value("maintenance"));

        mockMvc.perform(get("/api/v1/blog/articles/{slug}", "draft-article"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    private UUID insertAuthor(String email) {
        UUID authorId = UUID.randomUUID();
        jdbcTemplate.update(
                """
                insert into "users" ("id", "full_name", "phone", "email", "password_hash", "role", "status", "created_at", "updated_at")
                values (?, ?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)
                """,
                authorId,
                "Blog Author",
                "09" + Math.abs(authorId.hashCode()),
                email,
                "hash",
                "ADMIN",
                "ACTIVE"
        );
        return authorId;
    }

    private UUID insertCategory(String name, String slug) {
        UUID categoryId = UUID.randomUUID();
        jdbcTemplate.update(
                """
                insert into "blog_categories" ("id", "name", "slug", "description", "created_at")
                values (?, ?, ?, ?, current_timestamp)
                """,
                categoryId,
                name,
                slug,
                name + " description"
        );
        return categoryId;
    }

    private void insertArticle(
            UUID categoryId,
            UUID authorId,
            String title,
            String slug,
            String status,
            Instant publishedAt,
            String content
    ) {
        jdbcTemplate.update(
                """
                insert into "blog_articles" (
                  "id", "category_id", "author_id", "title", "slug", "thumbnail_url", "excerpt", "content",
                  "status", "view_count", "published_at", "created_at", "updated_at"
                ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)
                """,
                UUID.randomUUID(),
                categoryId,
                authorId,
                title,
                slug,
                "https://cdn.example.com/thumb.jpg",
                title + " excerpt",
                content,
                status,
                0,
                publishedAt == null ? null : Timestamp.from(publishedAt)
        );
    }
}
