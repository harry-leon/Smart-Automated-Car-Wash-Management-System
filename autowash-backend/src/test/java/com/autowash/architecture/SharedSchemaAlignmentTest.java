package com.autowash.architecture;

import static org.assertj.core.api.Assertions.assertThat;

import com.autowash.entity.User;
import com.autowash.entity.Booking;
import com.autowash.entity.Vehicle;
import com.autowash.entity.PointTransaction;
import com.autowash.entity.Combo;
import com.autowash.entity.Package;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.lang.reflect.Field;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SharedSchemaAlignmentTest {

    @Test
    void sharedEntitiesShouldMatchNewTableNames() {
        assertThat(tableName(User.class)).isEqualTo("users");
        assertThat(tableName(Booking.class)).isEqualTo("bookings");
        assertThat(tableName(Vehicle.class)).isEqualTo("vehicles");
        assertThat(tableName(Package.class)).isEqualTo("packages");
        assertThat(tableName(Combo.class)).isEqualTo("combos");
        assertThat(tableName(PointTransaction.class)).isEqualTo("point_transactions");
    }

    @Test
    void bookingAndCatalogEntitiesShouldUseUuidIdentifiers() {
        assertThat(idFieldType(Booking.class)).isEqualTo(UUID.class);
        assertThat(idFieldType(Package.class)).isEqualTo(UUID.class);
        assertThat(idFieldType(Combo.class)).isEqualTo(UUID.class);
    }

    @Test
    void vehicleAndPointTransactionRelationsShouldUseNewForeignKeys() throws Exception {
        assertThat(joinColumnName(Vehicle.class, "owner")).isEqualTo("customer_id");
        assertThat(joinColumnName(PointTransaction.class, "loyaltyAccount")).isEqualTo("loyalty_account_id");
    }

    private static String tableName(Class<?> type) {
        Table table = type.getAnnotation(Table.class);
        return table == null ? null : table.name();
    }

    private static Class<?> idFieldType(Class<?> type) {
        for (Field field : type.getDeclaredFields()) {
            if (field.getAnnotation(Id.class) != null) {
                return field.getType();
            }
        }
        return null;
    }

    private static String joinColumnName(Class<?> type, String fieldName) throws Exception {
        JoinColumn joinColumn = type.getDeclaredField(fieldName).getAnnotation(JoinColumn.class);
        return joinColumn == null ? null : joinColumn.name();
    }
}
