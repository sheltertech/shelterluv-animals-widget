import source from 'social-share-kit/dist/js/social-share-kit.min.js?raw';

// Legacy IIFE assigns `var SocialShareKit` without exporting a module.
const SocialShareKit = new Function(`${source}; return SocialShareKit;`)();

export default SocialShareKit;
