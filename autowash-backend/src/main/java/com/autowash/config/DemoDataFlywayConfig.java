package com.autowash.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import jakarta.annotation.PostConstruct;

@Configuration
@Profile("local")
@DependsOn("flywayInitializer")
public class DemoDataFlywayConfig {

    @Autowired
    private DataSource dataSource;
    
    @PostConstruct
    public void migrateDemoData() {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/demo")
                .table("flyway_demo_history")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .outOfOrder(true)
                .load();
        
        flyway.migrate();
    }
}
