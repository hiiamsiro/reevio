import type { CtaType } from './content-studio';

export interface PromptPresetDefinition {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly prompt: string;
}

export const promptPresets: readonly PromptPresetDefinition[] = [
  {
    id: 'luxury-fitting-room-corset',
    title: 'Luxury Fitting Room Corset',
    preview: 'Black lace corset, faux leather leggings, luxury mirror selfie in a marble fitting room.',
    prompt:
      'Dac diem khuon mat/Makeup: Guong mat trai xoan mem mai, song mui thanh tu, chuan Viet Nam. Lan da trang hong rang ro (fair pinkish-white skin) voi hieu ung da bong nuoc (dewy "glass skin"). Trang diem phong cach Douyin: moi peachy-pink căng mọng, watery finish; ma hong nhe tren go ma va dau mui. Doi mat nau sam voi long mi dai tu nhien. Toc den huyen, dai va day, duoc tao kieu gon song buong xoa tu nhien.\n\nTrang phuc: Ao corset ren den (black lace corset-style top) voi cau truc khung (boning) dinh hinh vong eo sieu nho, ket hop voi quan da bo sat mau den (skin-tight black faux leather leggings) co do bong nhe. Ao khoac blazer da hoac denim khoac ho qua vai.\n\nPhu kien: Vong co choker mong bang vang. Tui kep nach leather baguette bag mau den voi cac chi tiet kim loai. Mong tay dang almond dai, son mau hong pastel dinh da lap lanh.\n\nTu the & boi canh: Dung truoc guong lon trong phong thay do cao cap (luxury fitting room) voi san da cam thach va anh sang den roi (track lighting) vang am. Tu the dung thang, mot tay chong hong, tay kia cam iPhone Pro che mat kieu mirror selfie hiding face.\n\nThong so ky thuat: Chup tren may Canon EOS R5, ong kinh RF 85mm f/1.2L. Khau do f/1.4 de tao hieu ung bokeh min va tap trung vao chi tiet da va trang phuc. Do phan giai toi da 8K, ultra-sharp professional realism.',
  },
  {
    id: 'denim-street-store',
    title: 'Denim Street Store',
    preview: 'Tube top, distressed micro-shorts, chain belt, mirror selfie in a trendy clothing store.',
    prompt:
      'Subject & Face: 100% identical face to the reference, pure Vietnamese aesthetic. Radiant porcelain skin, soft pinkish blush visible on the shoulders.\n\nOutfit & Body: Wearing a tiny denim tube top (boob tube) and low-waist distressed denim micro-shorts with a silver chain belt. This outfit maximizes the visibility of the slim midriff, diamond belly button piercing, and curvy hips.\n\nPose & Environment: Standing in a trendy clothing store with aesthetic mirrors. The smartphone obscuring the face, focusing entirely on the body proportions and the bold street-style outfit. One leg slightly forward for a leg-lengthening effect.\n\nTechnical Specs: 8K resolution, sharp focus on denim grain and skin texture, natural daylight mixed with indoor spotlights, cinematic bokeh.',
  },
  {
    id: 'black-corset-dressing-room',
    title: 'Black Corset Dressing Room',
    preview: 'Semi-sheer lace corset, leather leggings, luxury dressing room, white iPhone selfie.',
    prompt:
      'Subject & Face: Mirror selfie of a young Vietnamese woman, face exactly 100% identical to the reference. Features: fair pinkish-white skin with a radiant "glass-skin" glow. Long, silky straight jet-black hair.\n\nOutfit & Body: Wearing a black semi-sheer lace corset top with boning details to accentuate a tiny waist, paired with high-waist skin-tight black faux leather leggings. The outfit perfectly highlights her voluptuous 3-round curves. A thin diamond choker around the neck.\n\nPose & Environment: Standing in front of a floor-to-ceiling mirror in a modern luxury dressing room. Holding a white iPhone 15 Pro Max at face level, completely obscuring the face. One hand resting on the hip to emphasize the curve.\n\nTechnical Specs: 8K resolution, photorealistic, sharp focus on leather textures and skin grain. Cinematic indoor lighting with purple and warm white neon accents.',
  },
  {
    id: 'yellow-crop-arch-mirror',
    title: 'Yellow Crop Arch Mirror',
    preview: 'Soft yellow crop top, lace-trim shorts, kneeling pose, daylight by an arch mirror.',
    prompt:
      'Subject & Face: 100% identical face to the reference, pure Vietnamese aesthetic. Radiant porcelain skin with visible macro details. Long straight jet-black hair, appearing naturally messy as if just woke up.\n\nOutfit & Body: Wearing a soft light-yellow fitted crop top with thin straps, revealing the midriff and slim waist. Paired with white lace-trimmed micro-shorts. Diamond belly button piercing sparkling under the light.\n\nPose & Environment: Kneeling on a plush cream-white rug in front of a minimalist arch mirror. Left hand holding a smartphone covering her face. The reflected view appears slightly angled downward, emphasizing the torso proportions.\n\nTechnical Specs: Shot on Sony A7R IV, 8K resolution. Soft natural daylight entering the room, preventing harsh shadows. Realistic skin texture with no airbrushing.',
  },
  {
    id: 'burgundy-slip-bedroom',
    title: 'Burgundy Slip Bedroom',
    preview: 'Burgundy satin slip dress, crystal nails, luxury bedroom, softly twisted mirror pose.',
    prompt:
      'Subject & Face: Mirror selfie of a young Vietnamese woman, face exactly 100% identical to the reference photo. Features: fair pinkish-white skin with a radiant "glass-skin" glow. Long, voluminous wavy dark brown hair falling naturally over shoulders.\n\nOutfit & Body: Wearing a sexy burgundy satin slip dress with delicate black lace trim at the neckline. The fabric clings to her full-proportioned 3-round curves and slim waist. Long almond-shaped white nails decorated with sparkling crystals.\n\nPose & Environment: Standing in front of a floor-to-ceiling mirror in a luxury bedroom. Holding a white triple-camera iPhone at face level, completely covering the face. Body slightly twisted to emphasize the curvy silhouette.\n\nTechnical Specs: 8K resolution, photorealistic, sharp focus on silk textures and skin grain. Soft warm indoor lighting with cinematic bokeh.',
  },
  {
    id: 'black-silk-bedroom',
    title: 'Black Silk Bedroom',
    preview: 'Black silk set, warm ambient bedroom lighting, face-covered mirror selfie pose.',
    prompt:
      'Subject & Face: A mirror selfie of a young Vietnamese woman, face exactly 100% identical to the reference photo. Features: soft oval face shape, delicate small nose, and fair pinkish-white skin with a natural "dewy" glow. Long straight jet-black hair falling naturally.\n\nOutfit & Body: Wearing an extremely sexy black silk lingerie set with delicate lace embroidery. The thin straps and low-cut neckline highlight her voluptuous 3-round curves (full bust, tiny waist, and curvy hips). She is wearing a diamond belly button piercing as described in the documents.\n\nPose & Environment: Standing in a modern bedroom with warm ambient lighting. Holding a white iPhone 15 Pro Max to cover her face, showing only her jawline and hair. One hand slightly pulling the silk fabric to emphasize the hip curve.\n\nTechnical Specs: 8K resolution, photorealistic, no Western features, sharp focus on skin texture and silk fabric, soft cinematic lighting, high contrast.',
  },
  {
    id: 'boutique-denim-ruffle',
    title: 'Boutique Denim Ruffle',
    preview: 'Dark navy denim tube top, sheer ruffled mini skirt, fashion boutique mirror wall.',
    prompt:
      'Subject & Face: 100% identical face to the original file, no modifications. Asian beauty with large sparkling dark eyes and fair pinkish-white skin. Long, straight jet-black hair with a small hair clip on the side.\n\nOutfit & Body: A dark navy denim tube top combined with a sheer white ruffled mini skirt. The form-fitting design uses corset-like seams to accentuate the body shape. Slim figure with well-proportioned 3-round curves.\n\nSetting & Environment: Inside a high-end fashion boutique with marble floors and warm track lighting. Standing confidently in front of a mirror wall.\n\nTechnical Specs: Canon EOS R5, RF 85mm f/1.2L lens. f/1.4 aperture, 8K, high contrast, sharp lighting and shadows to enhance body definition.',
  },
  {
    id: 'yellow-top-denim-dressing-room',
    title: 'Yellow Top Denim Dressing Room',
    preview: 'Douyin makeup, yellow crop top, faded denim shorts, arch mirror dressing room.',
    prompt:
      'Subject & Face: A mirror selfie of the woman with face exactly 100% identical to the attached file. Fair pinkish skin tone with a healthy glow. Douyin-style makeup: shimmering highlights on the nose and cheekbones, glossy peachy-pink lips. Long straight dark brown hair, left naturally loose.\n\nOutfit & Accessories: Wearing a soft light-yellow fitted crop top with thin straps, revealing the midriff and slim waist. Paired with low-waist faded denim shorts that emphasize hip curves. Long almond-shaped white nails decorated with sparkling crystals. Holding a white triple-camera iPhone in a transparent case.\n\nPose & Environment: Standing in front of a large arch-shaped mirror in a modern dressing room. Body slightly twisted to the side to highlight the curvy silhouette and body proportions. Soft natural daylight entering from the side, creating gentle depth.\n\nTechnical Specs: 8K resolution, photorealistic, sharp focus on clothing textures and skin grain, high contrast, cinematic indoor lighting.',
  },
  {
    id: 'urban-cafe-white-corset',
    title: 'Urban Cafe White Corset',
    preview: 'White lace-up corset, micro denim shorts, satin bomber, bright urban cafe mirror shot.',
    prompt:
      'Subject & Face: Mirror selfie of a young Vietnamese woman, face exactly 100% identical to the original reference, no editing required. Features: fair pinkish-white skin with a radiant "dewy glass-skin" glow. Very long, thick, straight jet-black hair falling elegantly over her shoulders. She wears light gray contact lenses providing a striking, soulful gaze.\n\nOutfit & Body: A bold and sexy outfit consisting of a white lace-up corset crop top that cinches the waist, paired with ultra-tight micro-denim shorts and a matching oversized white silk-satin bomber jacket worn off-the-shoulder. The outfit perfectly accentuates her voluptuous 3-round curves and slim midriff. A diamond belly button piercing is visible.\n\nAccessories: A delicate gold necklace with a small pendant, small diamond stud earrings, and long white almond-shaped nails decorated with sparkling crystals. She is holding a white iPhone 17, positioned to partially obscure her face in a trendy mirror selfie pose.\n\nSetting & Environment: Standing in front of a large minimalist mirror at the entrance of a trendy urban cafe. The background features rustic brick walls, polished concrete textures, and lush green cactus plants. Bright, vibrant sunlight creates a high-contrast, energetic city atmosphere.\n\nTechnical Specs: Shot on Sony A7R IV, 35mm f/1.4 GM lens, 8K resolution, photorealistic. Sharp focus on fabric textures (lace and silk) and realistic skin grain. Cinematic urban fashion photography style.',
  },
] as const;

export const styleModes = [
  'Cinematic neon',
  'Clean product studio',
  'Creator UGC',
  'Luxury editorial',
] as const;

export const workflowNotes = [
  'Credits are reserved before processing starts.',
  'Failed final renders refund credits automatically.',
  'Preview state refreshes every 2.5 seconds.',
  'Voiceover and subtitles appear after orchestration.',
] as const;

export const INITIAL_HOOK_SOURCE = 'Compact espresso machine for busy home baristas';
export const INITIAL_PROMPT =
  'Create an affiliate video for a compact espresso machine with strong hook and CTA.';
export const CTA_TYPES: readonly CtaType[] = ['urgency', 'scarcity', 'discount'];
