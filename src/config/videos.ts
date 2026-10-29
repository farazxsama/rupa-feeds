/**
 * YouTube videos shown on the homepage (<YouTubeVideos/>).
 *
 * `url` accepts any normal YouTube link — watch (youtube.com/watch?v=…),
 * short (youtu.be/…), Shorts, or embed (youtube.com/embed/…). Leave it empty
 * and a placeholder tile is shown instead of a player.
 */
export type YouTubeVideo = {
  title: string;
  url: string;
};

export const videos = {
  title: "Watch Rupa Feeds in Action",
  subtitle: "See our feeds at work on farms, and hear from the farmers who use them.",
  items: [
    { title: "Rupa Feeds", url: "https://www.youtube.com/embed/TvMVKSnOrG4?si=yKLla3LQy2sZlYVm" },
    { title: "Rupa Feeds", url: "https://www.youtube.com/embed/QVsnG6fpXAE?si=uUrIBGDnp2G02_6P" },
    { title: "Rupa Feeds", url: "https://www.youtube.com/embed/vX6ajvKVzXU?si=cdrH7YOdI9OiajTO" },
  ] as YouTubeVideo[],
};
