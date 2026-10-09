package com.be.service.impl;

import com.be.entity.Buddy;
import com.be.enums.*;
import java.util.*;

public final class MatchingRules {
    private MatchingRules() { }

    public static Set<MatchingTag> shared(Set<MatchingTag> wanted, Set<MatchingTag> actual) {
        Set<MatchingTag> result = new LinkedHashSet<>(wanted);
        result.retainAll(actual);
        return result;
    }

    public static boolean tagsMatch(Set<MatchingTag> wanted, Set<MatchingTag> actual, boolean all) {
        return wanted.isEmpty() || (all ? actual.containsAll(wanted) : !Collections.disjoint(wanted, actual));
    }

    public static boolean buddyMatches(Buddy buddy, Set<MatchingTag> tags, boolean all,
                                       String language, GuidingStyle style) {
        return buddy.getStatus() == BuddyStatus.ACTIVE && buddy.getUser() != null
                && buddy.getUser().getStatus() == UserStatus.ACTIVE && buddy.getUser().getRole() == UserRole.BUDDY
                && tagsMatch(tags, buddy.getInterests(), all)
                && (language == null || buddy.getLanguages().contains(language))
                && (style == null || buddy.getGuidingStyle() == style);
    }
}
