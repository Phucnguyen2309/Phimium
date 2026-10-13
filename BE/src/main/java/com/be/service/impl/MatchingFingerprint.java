package com.be.service.impl;

import com.be.dto.response.ActivityResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.ItineraryStopResponse;
import com.be.entity.Activity;
import com.be.entity.Buddy;
import com.be.entity.ItineraryStop;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/** Detect changes to the actual experience/profile shown in a proposal. Ratings may evolve independently. */
public final class MatchingFingerprint {
    private MatchingFingerprint() { }
    public static String of(ActivityResponse activity, List<BuddyResponse> buddies) {
        List<String> values = tour(activity.getTitle(), activity.getDescription(), activity.getLocationName(), activity.getAddress(),
                activity.getTags());
        for (ItineraryStopResponse stop : activity.getItineraryStops()) {
            stop(values, stop.getStopId(), stop.getStopOrder(), stop.getTitle(), stop.getDescription(),
                    stop.getOffsetMinutes(), stop.getDurationMinutes(), stop.getImageUrl());
        }
        for (BuddyResponse b : buddies) buddy(values, b.getBuddyId(), b.getInterests(), b.getSkills(), b.getLanguages(),
                b.getGuidingStyle(), b.getBio(), b.getExperience(), b.getIntroduction());
        return hash(values);
    }
    public static String of(Activity activity, List<Buddy> buddies) {
        List<String> values = tour(activity.getTitle(), activity.getDescription(), activity.getLocationName(), activity.getAddress(),
                activity.getTags());
        for (ItineraryStop stop : activity.getItineraryStops()) {
            stop(values, stop.getStopId(), stop.getStopOrder(), stop.getTitle(), stop.getDescription(),
                    stop.getOffsetMinutes(), stop.getDurationMinutes(), stop.getImageUrl());
        }
        for (Buddy b : buddies) buddy(values, b.getBuddyId(), b.getInterests(), b.getSkills(), b.getLanguages(),
                b.getGuidingStyle(), b.getBio(), b.getExperience(), b.getIntroduction());
        return hash(values);
    }
    private static List<String> tour(String title, String description, String location, String address,
                                     Collection<?> tags) {
        List<String> values = new ArrayList<>(); values.add(Objects.toString(title, "")); values.add(Objects.toString(description, ""));
        values.add(Objects.toString(location, "")); values.add(Objects.toString(address, ""));
        values.add(sorted(tags));
        return values;
    }
    private static void stop(List<String> values, UUID id, Integer order, String title, String description,
            Integer offset, Integer duration, String imageUrl) {
        values.add(Objects.toString(id, "")); values.add(Objects.toString(order, ""));
        values.add(title); values.add(description);
        values.add(offset.toString()); values.add(duration.toString());
        values.add(Objects.toString(imageUrl, ""));
    }
    private static void buddy(List<String> values, UUID id, Collection<?> tags, Collection<?> skills,
            Collection<?> languages, Object style, String bio, String experience, String introduction) {
        values.add(id.toString()); values.add(sorted(tags)); values.add(sorted(skills)); values.add(sorted(languages));
        values.add(Objects.toString(style, "")); values.add(Objects.toString(bio, ""));
        values.add(Objects.toString(experience, "")); values.add(Objects.toString(introduction, ""));
    }
    private static String sorted(Collection<?> values) {
        return values.stream().map(Object::toString).sorted().collect(Collectors.joining("\u0000"));
    }
    private static String hash(List<String> values) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            for (String value : values) {
                byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
                digest.update(ByteBuffer.allocate(4).putInt(bytes.length).array()); digest.update(bytes);
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
