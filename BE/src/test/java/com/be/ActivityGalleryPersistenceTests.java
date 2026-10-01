package com.be;

import com.be.entity.Activity;
import com.be.entity.User;
import com.be.enums.TourType;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import com.be.repository.ActivityRepository;
import com.be.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {"spring.datasource.url=jdbc:h2:mem:gallery;MODE=PostgreSQL",
        "spring.datasource.username=sa", "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop"})
class ActivityGalleryPersistenceTests {
    @Autowired ActivityRepository activities;
    @Autowired UserRepository users;
    @Autowired TestEntityManager entityManager;

    @Test void preservesImageOrderAfterReloadAndDeletesGalleryWithActivity() {
        var user = users.saveAndFlush(User.builder().email("gallery@example.com")
                .role(UserRole.ADMIN).status(UserStatus.ACTIVE).build());
        var urls = List.of("https://res.cloudinary.com/demo/z.jpg", "https://res.cloudinary.com/demo/a.jpg");
        var activity = activities.saveAndFlush(Activity.builder().title("Food tour")
                .activityType(TourType.FOODTOUR).locationName("HCM").address("District 1")
                .minimumParticipants(2).maximumParticipants(20).createdBy(user)
                .imageUrls(new ArrayList<>(urls)).build());
        var id = activity.getId();
        entityManager.clear();
        assertEquals(urls, activities.findById(id).orElseThrow().getImageUrls());
        activities.deleteById(id);
        activities.flush();
        Number remaining = (Number) entityManager.getEntityManager()
                .createNativeQuery("select count(*) from activity_images").getSingleResult();
        assertEquals(0, remaining.intValue());
    }
}
