
import words from './words.js';

export const generateWord = (words) => {
    return words[Math.floor(Math.random() * words.length)]
}