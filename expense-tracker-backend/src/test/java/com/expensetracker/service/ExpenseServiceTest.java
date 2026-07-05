package com.expensetracker.service;

import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.NotificationRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.impl.ExpenseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private User testUser;
    private Expense testExpense;
    private ExpenseDto testExpenseDto;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("user@example.com")
                .password("hashed_pwd")
                .role(Role.USER)
                .build();

        testExpense = Expense.builder()
                .id(100L)
                .amount(new BigDecimal("150.50"))
                .category("Food & Drinks")
                .description("Lunch with client")
                .paymentMethod("Credit Card")
                .merchant("Tasty Grill")
                .expenseDate(LocalDate.now())
                .user(testUser)
                .build();

        testExpenseDto = ExpenseDto.builder()
                .amount(new BigDecimal("150.50"))
                .category("Food & Drinks")
                .description("Lunch with client")
                .paymentMethod("Credit Card")
                .merchant("Tasty Grill")
                .expenseDate(LocalDate.now())
                .build();
    }

    @Test
    void testCreateExpense_Success() {
        // Arrange
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);
        when(budgetRepository.findByUserIdAndMonthAndYear(anyLong(), anyString(), anyInt())).thenReturn(Optional.empty());

        // Act
        ExpenseDto result = expenseService.createExpense("user@example.com", testExpenseDto);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(new BigDecimal("150.50"), result.getAmount());
        assertEquals("Food & Drinks", result.getCategory());
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    void testGetExpenseById_Success() {
        // Arrange
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(100L)).thenReturn(Optional.of(testExpense));

        // Act
        ExpenseDto result = expenseService.getExpenseById("user@example.com", 100L);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Tasty Grill", result.getMerchant());
    }

    @Test
    void testGetExpenseById_AccessDenied() {
        // Arrange
        User anotherUser = User.builder().id(2L).email("other@example.com").build();
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(anotherUser));
        when(expenseRepository.findById(100L)).thenReturn(Optional.of(testExpense));

        // Act & Assert
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> {
            expenseService.getExpenseById("other@example.com", 100L);
        });
    }
}
