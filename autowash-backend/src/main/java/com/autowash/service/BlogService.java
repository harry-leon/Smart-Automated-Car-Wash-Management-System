package com.autowash.service;

import com.autowash.dto.BlogArticleDetailResponse;
import com.autowash.dto.BlogArticleSummaryResponse;
import java.util.List;

public interface BlogService {
    List<BlogArticleSummaryResponse> listPublishedArticles(int limit);
    BlogArticleDetailResponse getPublishedArticle(String slug);
}
