// lib/avatars.js
export const AVATARS = [
  "/1.png",
  "/2.png",
  "/3.png",
  "/4.png",
  "/5.png",
  "/6.png",
  "/g.png"
];
//done

export function getRandomAvatarIndex() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}