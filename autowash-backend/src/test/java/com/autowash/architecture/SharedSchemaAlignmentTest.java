package com.autowash.architecture;

import static org.assertj.core.api.Assertions.assertThat;

import com.autowash.entity.AuthUser;
import com.autowash.entity.CustomerBooking;
import com.autowash.entity.CustomerVehicle;
import com.autowash.entity.PointTransaction;
import com.autowash.entity.ServiceCombo;
import com.autowash.entity.ServicePackage;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.lang.reflect.Field;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SharedSchemaAlignmentTest {

    @Test
    void sharedEntitiesShouldMatchNewTableNames() {
        assertThat(tableName(AuthUser.class)).isEqualTo("users");
        assertThat(tableName(CustomerBooking.class)).isEqualTo("bookings");
        assertThat(tableName(CustomerVehicle.class)).isEqualTo("vehicles");
        assertThat(tableName(ServicePackage.class)).isEqualTo("packages");
        assertThat(tableName(ServiceCombo.class)).isEqualTo("combos");
        assertThat(tableName(PointTransaction.class)).isEqualTo("point_transactions");
    }

    @Test
    void bookingAndCatalogEntitiesShouldUseUuidIdentifiers() {
        assertThat(idFieldType(CustomerBooking.class)).isEqualTo(UUID.class);
        assertThat(idFieldType(ServicePackage.class)).isEqualTo(UUID.class);
        assertThat(idFieldType(ServiceCombo.class)).isEqualTo(UUID.class);
    }

    @Test
    void vehicleAndPointTransactionRelationsShouldUseNewForeignKeys() throws Exception {
        assertThat(joinColumnName(CustomerVehicle.class, "owner")).isEqualTo("customer_id");
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
