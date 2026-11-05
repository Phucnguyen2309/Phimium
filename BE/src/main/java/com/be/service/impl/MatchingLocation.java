package com.be.service.impl;

import com.be.entity.Activity;
import com.be.entity.ItineraryStop;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/** Location prefilter only; the ranking step still verifies the requested experiences. */
final class MatchingLocation {
    private static final Pattern NEGATED = Pattern.compile(
            "(?:^| )(?:khong|chang|chua|not|no|never|without|excluding|exclude|doesnt|dont)"
                    + "(?: [\\p{L}\\p{N}]+){0,6} $");
    private static final List<Alias> ALIASES = aliases();

    private MatchingLocation() { }

    static boolean matches(Activity activity, String region) {
        if (region == null || region.isBlank()) return true;
        List<String> wanted = variants(region);
        if (wanted.isEmpty()) return false;
        List<String> facts = new ArrayList<>();
        facts.add(activity.getLocationName());
        facts.add(activity.getLocationNameEn());
        addAddress(facts, activity.getAddress());
        addAddress(facts, activity.getAddressEn());
        facts.add(activity.getTitle());
        facts.add(activity.getTitleEn());
        facts.add(activity.getDescription());
        facts.add(activity.getDescriptionEn());
        if (activity.getItineraryStops() != null) {
            for (ItineraryStop stop : activity.getItineraryStops()) {
                facts.add(stop.getTitle());
                facts.add(stop.getTitleEn());
                facts.add(stop.getDescription());
                facts.add(stop.getDescriptionEn());
            }
        }
        return facts.stream().filter(fact -> fact != null && !fact.isBlank())
                .anyMatch(fact -> contains(fact, wanted));
    }

    private static void addAddress(List<String> facts, String address) {
        facts.add(address);
        if (address == null) return;
        for (String component : address.split("[,;]")) {
            if (Set.of("ho chi minh", "hcm").contains(normalize(component))) {
                facts.add("Ho Chi Minh City");
            }
        }
    }

    private static boolean contains(String fact, List<String> wanted) {
        String normalized = " " + normalize(fact) + " ";
        for (String phrase : wanted) {
            String needle = " " + phrase + " ";
            int start = normalized.indexOf(needle);
            while (start >= 0) {
                String preceding = normalized.substring(Math.max(0, start - 100), start + 1);
                if (!NEGATED.matcher(preceding).find()) return true;
                start = normalized.indexOf(needle, start + 1);
            }
        }
        return false;
    }

    private static List<String> variants(String region) {
        String normalized = normalize(region);
        if (normalized.isBlank()) return List.of();
        // Bare city names are interpreted as cities only in the requested region, not in tour prose.
        if (Set.of("ho chi minh", "hcm").contains(normalized)) normalized = "ho chi minh city";
        Set<String> variants = new LinkedHashSet<>();
        variants.add(normalized);
        // Translate the place type without dropping the proper name or broadening it to a city.
        if (normalized.startsWith("cho ")) variants.add(normalized.substring(4) + " market");
        if (normalized.endsWith(" market")) variants.add("cho " + normalized.substring(0, normalized.length() - 7));
        return List.copyOf(variants);
    }

    private static String normalize(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}+", "")
                .replace('đ', 'd').replace('Đ', 'D').toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", " ").strip();
        for (Alias alias : ALIASES) normalized = alias.pattern().matcher(normalized).replaceAll(alias.canonical());
        return normalized;
    }

    private static List<Alias> aliases() {
        List<List<String>> groups = List.of(
                List.of("ho chi minh city", "thanh pho ho chi minh", "tp ho chi minh", "tp hcm", "tphcm",
                        "hcmc", "hcm city", "sai gon", "saigon"),
                List.of("cholon", "cho lon"));
        List<Alias> aliases = new ArrayList<>();
        for (List<String> group : groups) {
            for (String phrase : group) {
                if (!phrase.equals(group.get(0))) {
                    aliases.add(new Alias(Pattern.compile("(?<![\\p{L}\\p{N}])" + Pattern.quote(phrase)
                            + "(?![\\p{L}\\p{N}])"), group.get(0), phrase.length()));
                }
            }
        }
        aliases.sort(Comparator.comparingInt(Alias::length).reversed());
        return List.copyOf(aliases);
    }

    private record Alias(Pattern pattern, String canonical, int length) { }
}
