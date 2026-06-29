package com.autowash.repository;

import com.autowash.entity.BlogArticle;
import com.autowash.entity.enums.BlogArticleStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogArticleRepository extends JpaRepository<BlogArticle, UUID> {

    @EntityGraph(attributePaths = {"category", "author"})
    List<BlogArticle> findByStatusAndPublishedAtIsNotNullOrderByPublishedAtDesc(
            BlogArticleStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"category", "author"})
    Optional<BlogArticle> findBySlugAndStatusAndPublishedAtIsNotNull(String slug, BlogArticleStatus status);

    @EntityGraph(attributePaths = {"category", "author"})
    List<BlogArticle> findAllByOrderByCreatedAtDesc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);
}
