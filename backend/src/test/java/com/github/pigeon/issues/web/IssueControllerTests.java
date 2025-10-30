package com.github.pigeon.issues.web;

import com.github.pigeon.issues.IssueCommands;
import com.github.pigeon.issues.IssueQueries;
import com.github.pigeon.security.RateLimitFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = IssueController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = RateLimitFilter.class)
)
class IssueControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    IssueQueries issueQueries;

    @MockitoBean
    IssueCommands issueCommands;

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should insert and retrieve an issue")
    void shouldInsertAndRetrieveIssue() throws Exception {
        mockMvc.perform(get("/api/issues"))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));

        String validTitle = "Test Issue";
        mockMvc.perform(post("/api/issues").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"" + validTitle + "\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/issues"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should validate issue title length")
    void shouldValidateIssueTitleLength() throws Exception {
        mockMvc.perform(post("/api/issues").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\": \"a\"}"));

        String tooLongTitle = "a".repeat(400);
        mockMvc.perform(post("/api/issues").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"" + tooLongTitle + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }
}
