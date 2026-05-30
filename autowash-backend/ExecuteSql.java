import java.sql.*;
import java.util.Scanner;

public class ExecuteSql {
    private static final String URL = "jdbc:postgresql://localhost:5432/autowash";
    private static final String USER = "postgres";
    private static final String PASSWORD = "123456";

    public static void main(String[] args) {
        System.out.println("Kết nối đến Database...");
        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {
            System.out.println("Kết nối thành công! Gõ lệnh SQL của bạn bên dưới (Gõ 'exit' hoặc 'quit' để thoát):");
            Scanner scanner = new Scanner(System.in);
            
            while (true) {
                System.out.print("\nautowash=# ");
                String sql = scanner.nextLine().trim();
                
                if (sql.equalsIgnoreCase("exit") || sql.equalsIgnoreCase("quit")) {
                    System.out.println("Tạm biệt!");
                    break;
                }
                
                if (sql.isEmpty()) continue;
                
                try (Statement stmt = conn.createStatement()) {
                    // Execute returns true if the first result is a ResultSet
                    boolean isResultSet = stmt.execute(sql);
                    
                    if (isResultSet) {
                        try (ResultSet rs = stmt.getResultSet()) {
                            ResultSetMetaData metaData = rs.getMetaData();
                            int columnCount = metaData.getColumnCount();
                            
                            // In tên cột
                            for (int i = 1; i <= columnCount; i++) {
                                System.out.printf("%-20s", metaData.getColumnName(i));
                            }
                            System.out.println("\n" + "-".repeat(20 * columnCount));
                            
                            // In dữ liệu
                            int rowCount = 0;
                            while (rs.next()) {
                                for (int i = 1; i <= columnCount; i++) {
                                    System.out.printf("%-20s", rs.getString(i));
                                }
                                System.out.println();
                                rowCount++;
                            }
                            System.out.println("(" + rowCount + " rows)");
                        }
                    } else {
                        // Nếu là lệnh INSERT/UPDATE/DELETE
                        int updateCount = stmt.getUpdateCount();
                        System.out.println("Thành công! Số dòng bị ảnh hưởng: " + updateCount);
                    }
                } catch (SQLException e) {
                    System.err.println("Lỗi SQL: " + e.getMessage());
                }
            }
        } catch (SQLException e) {
            System.err.println("Lỗi kết nối CSDL: " + e.getMessage());
        }
    }
}
