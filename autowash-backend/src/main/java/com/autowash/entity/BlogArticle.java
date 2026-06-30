package com.autowash.entity;

import com.autowash.entity.enums.BlogArticleStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "blog_articles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BlogArticle {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private BlogCategory category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(length = 500)
    private String excerpt;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BlogArticleStatus status;

    @Column(name = "view_count", nullable = false)
    private int viewCount;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public BlogArticle(
            BlogCategory category,
            User author,
            String title,
            String slug,
            String thumbnailUrl,
            String excerpt,
            String content,
            BlogArticleStatus status
    ) {
        Instant now = Instant.now();
        this.id = UUID.randomUUID();
        this.category = category;
        this.author = author;
        this.title = title;
        this.slug = slug;
        this.thumbnailUrl = thumbnailUrl;
        this.excerpt = excerpt;
        this.content = content;
        this.status = status == null ? BlogArticleStatus.DRAFT : status;
        this.viewCount = 0;
        this.createdAt = now;
        this.updatedAt = now;
        this.publishedAt = this.status == BlogArticleStatus.PUBLISHED ? now : null;
    }

    public void update(
            BlogCategory category,
            String title,
            String slug,
            String thumbnailUrl,
            String excerpt,
            String content,
            BlogArticleStatus status
    ) {
        this.category = category;
        this.title = title;
        this.slug = slug;
        this.thumbnailUrl = thumbnailUrl;
        this.excerpt = excerpt;
        this.content = content;
        updateStatus(status);
        this.updatedAt = Instant.now();
    }

    public void updateStatus(BlogArticleStatus status) {
        BlogArticleStatus nextStatus = status == null ? BlogArticleStatus.DRAFT : status;
        if (this.status != BlogArticleStatus.PUBLISHED && nextStatus == BlogArticleStatus.PUBLISHED) {
            this.publishedAt = Instant.now();
        }
        this.status = nextStatus;
        this.updatedAt = Instant.now();
    }

    public void incrementViewCount() {
        this.viewCount += 1;
        this.updatedAt = Instant.now();
    }
}
