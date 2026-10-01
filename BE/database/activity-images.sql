-- PostgreSQL: gallery URLs for each activity, preserving display order.
CREATE TABLE IF NOT EXISTS activity_images (
    activity_id UUID NOT NULL REFERENCES activities(activity_id),
    image_order INTEGER NOT NULL,
    image_url VARCHAR(2048) NOT NULL,
    PRIMARY KEY (activity_id, image_order)
);
