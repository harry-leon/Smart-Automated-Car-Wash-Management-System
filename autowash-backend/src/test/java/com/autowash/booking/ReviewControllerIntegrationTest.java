package com.autowash.booking;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.autowash.entity.Review;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.repository.BookingRepository;
import com.autowash.repository.ReviewRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReviewControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Test
    void submitReviewCreatesReviewForOwnedCompletedBooking() throws Exception {
        String accessToken = registerActivateAndLogin("0902234701");
        String vehicleId = createVehicle(accessToken, "30H-323456");
        String bookingId = createBooking(accessToken, vehicleId);
        setBookingStatus(bookingId, BookingStatus.COMPLETED);

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "rating": 5,
                                  "comment": "Xe sach va nhan vien ho tro tot",
                                  "beforeImageUrl": "https://cdn.example.com/reviews/before-1.jpg",
                                  "afterImageUrl": "https://cdn.example.com/reviews/after-1.jpg"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.bookingId").value(bookingId))
                .andExpect(jsonPath("$.data.rating").value(5))
                .andExpect(jsonPath("$.data.comment").value("Xe sach va nhan vien ho tro tot"))
                .andExpect(jsonPath("$.data.featured").value(false));
    }

    @Test
    void submitReviewRejectsBookingOwnedByAnotherCustomer() throws Exception {
        String ownerToken = registerActivateAndLogin("0902234702");
        String otherToken = registerActivateAndLogin("0902234703");
        String vehicleId = createVehicle(ownerToken, "30H-323457");
        String bookingId = createBooking(ownerToken, vehicleId);
        setBookingStatus(bookingId, BookingStatus.COMPLETED);

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "rating": 4,
                                  "comment": "Khong phai booking cua toi"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void submitReviewRejectsBookingThatIsNotCompleted() throws Exception {
        String accessToken = registerActivateAndLogin("0902234704");
        String vehicleId = createVehicle(accessToken, "30H-323458");
        String bookingId = createBooking(accessToken, vehicleId);
        setBookingStatus(bookingId, BookingStatus.CONFIRMED);

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "rating": 4,
                                  "comment": "Muon review som"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void submitReviewRejectsDuplicateReviewForSameBooking() throws Exception {
        String accessToken = registerActivateAndLogin("0902234705");
        String vehicleId = createVehicle(accessToken, "30H-323459");
        String bookingId = createBooking(accessToken, vehicleId);
        setBookingStatus(bookingId, BookingStatus.COMPLETED);

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "rating": 5,
                                  "comment": "Lan dau review"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "rating": 3,
                                  "comment": "Review lai"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_CONFLICT"));
    }

    @Test
    void getFeaturedReviewsIsPublicAndReturnsOnlyFeaturedItems() throws Exception {
        String featuredToken = registerActivateAndLogin("0902234706");
        String featuredVehicleId = createVehicle(featuredToken, "30H-323460");
        String featuredBookingId = createBooking(featuredToken, featuredVehicleId);
        setBookingStatus(featuredBookingId, BookingStatus.COMPLETED);
        saveReview(featuredBookingId, 5, "Review noi bat", true);

        String regularToken = registerActivateAndLogin("0902234707");
        String regularVehicleId = createVehicle(regularToken, "30H-323461");
        String regularBookingId = createBooking(regularToken, regularVehicleId);
        setBookingStatus(regularBookingId, BookingStatus.COMPLETED);
        saveReview(regularBookingId, 4, "Review thuong", false);

        mockMvc.perform(get("/api/v1/reviews/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].bookingId").value(featuredBookingId))
                .andExpect(jsonPath("$.data[0].comment").value("Review noi bat"))
                .andExpect(jsonPath("$.data[0].featured").value(true));
    }

    private String createBooking(String accessToken, String vehicleId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/customers/bookings")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "vehicleId": "%s",
                                  "packageId": "12345678-1234-1234-1234-123456789012",
                                  "bookingDate": "%s",
                                  "bookingTime": "14:00",
                                  "paymentMethod": "E_WALLET"
                                }
                                """.formatted(vehicleId, futureBookingDate())))
                .andExpect(status().isCreated())
                .andReturn();
        return readJson(result).path("data").path("bookingId").asText();
    }

    private String createVehicle(String accessToken, String plate) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/customers/vehicles")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "plate": "%s",
                                  "type": "CAR",
                                  "brand": "Toyota",
                                  "model": "Camry",
                                  "year": 2023,
                                  "color": "Silver"
                                }
                                """.formatted(plate)))
                .andExpect(status().isCreated())
                .andReturn();
        return readJson(result).path("data").path("vehicleId").asText();
    }

    private void setBookingStatus(String bookingId, BookingStatus status) {
        var booking = bookingRepository.findById(UUID.fromString(bookingId)).orElseThrow();
        booking.updateStatus(status);
        bookingRepository.saveAndFlush(booking);
    }

    private void saveReview(String bookingId, int rating, String comment, boolean featured) {
        var booking = bookingRepository.findById(UUID.fromString(bookingId)).orElseThrow();
        Review review = new Review(booking.getCustomer(), booking, rating, comment, null, null);
        ReflectionTestUtils.setField(review, "featured", featured);
        reviewRepository.saveAndFlush(review);
    }

    private String registerActivateAndLogin(String emailLocalPart) throws Exception {
        String email = emailLocalPart + "@example.com";

        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Nguyen Van A",
                                  "email": "%s",
                                  "password": "SecurePass1!",
                                  "passwordConfirm": "SecurePass1!"
                                }
                                """.formatted(email)))
                .andReturn();

        String otp = readJson(registerResult).path("data").path("devOtp").asText();

        MvcResult verifyOtpResult = mockMvc.perform(post("/api/v1/auth/otp/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "%s",
                                  "otp": "%s"
                                }
                                """.formatted(email, otp)))
                .andExpect(status().isOk())
                .andReturn();

        return readJson(verifyOtpResult).path("data").path("accessToken").asText();
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String futureBookingDate() {
        return LocalDate.now().plusDays(7).toString();
    }
}
