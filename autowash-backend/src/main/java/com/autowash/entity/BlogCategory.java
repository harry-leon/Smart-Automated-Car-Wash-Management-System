package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "blog_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BlogCategory {

    @Id
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public BlogCategory(String name, String slug, String description) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.createdAt = Instant.now();
    }

    public void update(String name, String slug, String description) {
        this.name = name;
        this.slug = slug;
        this.description = description;
    }
}
