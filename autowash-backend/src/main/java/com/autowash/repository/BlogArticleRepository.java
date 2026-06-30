package com.autowash.repository;

import com.autowash.entity.BlogArticle;
import com.autowash.entity.enums.BlogArticleStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogArticleRepository extends JpaRepository<BlogArticle, UUID> {
    List<BlogArticle> findByStatusOrderByPublishedAtDescCreatedAtDesc(BlogArticleStatus status);
    Optional<BlogArticle> findBySlugAndStatus(String slug, BlogArticleStatus status);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, UUID id);
}
