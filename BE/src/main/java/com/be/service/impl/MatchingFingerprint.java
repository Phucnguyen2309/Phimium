package com.be.service.impl;

import com.be.dto.response.*;
import com.be.entity.*;
import java.nio.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/** Detect changes to the actual experience/profile shown in a proposal. Ratings may evolve independently. */
public final class MatchingFingerprint {
    private MatchingFingerprint() { }
    public static String of(ActivityResponse activity, List<BuddyResponse> buddies) {
        List<String> values = tour(activity.getTitle(), activity.getDescription(), activity.getLocationName(), activity.getAddress(),
                activity.getTags(), activity.getItineraryStops());
        for (BuddyResponse b : buddies) buddy(values, b.getBuddyId(), b.getInterests(), b.getSkills(), b.getLanguages(),
                b.getGuidingStyle(), b.getBio(), b.getExperience(), b.getIntroduction());
        return hash(values);
    }
    public static String of(Activity activity, List<Buddy> buddies) {
        List<String> values = tour(activity.getTitle(), activity.getDescription(), activity.getLocationName(), activity.getAddress(),
                activity.getTags(), activity.getItineraryStops());
        for (Buddy b : buddies) buddy(values, b.getBuddyId(), b.getInterests(), b.getSkills(), b.getLanguages(),
                b.getGuidingStyle(), b.getBio(), b.getExperience(), b.getIntroduction());
        return hash(values);
    }
    private static List<String> tour(String title, String description, String location, String address,
                                     Collection<?> tags, List<ItineraryStop> stops) {
        List<String> values = new ArrayList<>(); values.add(Objects.toString(title, "")); values.add(Objects.toString(description, ""));
        values.add(Objects.toString(location, "")); values.add(Objects.toString(address, ""));
        values.add(sorted(tags));
        for (ItineraryStop s : stops) {
            values.add(s.getTitle()); values.add(s.getDescription());
            values.add(s.getOffsetMinutes().toString()); values.add(s.getDurationMinutes().toString());
        }
        return values;
    }
    private static void buddy(List<String> values, UUID id, Collection<?> tags, Collection<?> skills,
            Collection<?> languages, Object style, String bio, String experience, String introduction) {
        values.add(id.toString()); values.add(sorted(tags)); values.add(sorted(skills)); values.add(sorted(languages));
        values.add(Objects.toString(style, "")); values.add(Objects.toString(bio, ""));
        values.add(Objects.toString(experience, "")); values.add(Objects.toString(introduction, ""));
    }
    private static String sorted(Collection<?> values) {
        return values.stream().map(Object::toString).sorted().collect(java.util.stream.Collectors.joining("\u0000"));
    }
    private static String hash(List<String> values) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            for (String value : values) {
                byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
                digest.update(ByteBuffer.allocate(4).putInt(bytes.length).array()); digest.update(bytes);
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
