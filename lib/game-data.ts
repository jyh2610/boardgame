export type TileType =
  | 'START'
  | 'CITY'
  | 'KEY'
  | 'JAIL'
  | 'WELFARE'
  | 'TAX'
  | 'TRAVEL'
  | 'CORNER';

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  price?: number;
  rent?: number;
  houseRent?: number;
  hotelRent?: number;
  color?: string;
  flag?: string;
  description?: string;
}

export const BOARD_TILES: Tile[] = [
  // Bottom row (0–9): right to left
  { id: 0, name: '출발', type: 'START' },
  { id: 1, name: '서울', type: 'CITY', price: 600000, rent: 50000, houseRent: 150000, hotelRent: 300000, color: '#e74c3c', flag: '🇰🇷' },
  { id: 2, name: '황금열쇠', type: 'KEY' },
  { id: 3, name: '타이베이', type: 'CITY', price: 400000, rent: 30000, houseRent: 90000, hotelRent: 180000, color: '#3498db', flag: '🇹🇼' },
  { id: 4, name: '세금', type: 'TAX', description: '재산세 납부! 보유 자산의 5% 납부' },
  { id: 5, name: '베이징', type: 'CITY', price: 500000, rent: 40000, houseRent: 120000, hotelRent: 240000, color: '#e67e22', flag: '🇨🇳' },
  { id: 6, name: '황금열쇠', type: 'KEY' },
  { id: 7, name: '도쿄', type: 'CITY', price: 500000, rent: 40000, houseRent: 120000, hotelRent: 240000, color: '#9b59b6', flag: '🇯🇵' },
  { id: 8, name: '방콕', type: 'CITY', price: 300000, rent: 20000, houseRent: 60000, hotelRent: 120000, color: '#1abc9c', flag: '🇹🇭' },
  { id: 9, name: '무인도', type: 'JAIL' },

  // Left column (10–17): bottom to top
  { id: 10, name: '싱가포르', type: 'CITY', price: 550000, rent: 45000, houseRent: 135000, hotelRent: 270000, color: '#e74c3c', flag: '🇸🇬' },
  { id: 11, name: '황금열쇠', type: 'KEY' },
  { id: 12, name: '하노이', type: 'CITY', price: 250000, rent: 15000, houseRent: 45000, hotelRent: 90000, color: '#3498db', flag: '🇻🇳' },
  { id: 13, name: '자카르타', type: 'CITY', price: 350000, rent: 25000, houseRent: 75000, hotelRent: 150000, color: '#e67e22', flag: '🇮🇩' },
  { id: 14, name: '뉴델리', type: 'CITY', price: 400000, rent: 30000, houseRent: 90000, hotelRent: 180000, color: '#9b59b6', flag: '🇮🇳' },
  { id: 15, name: '사회복지기금', type: 'WELFARE', description: '행운! 사회복지기금에서 30만원 수령' },
  { id: 16, name: '카이로', type: 'CITY', price: 450000, rent: 35000, houseRent: 105000, hotelRent: 210000, color: '#1abc9c', flag: '🇪🇬' },
  { id: 17, name: '이스탄불', type: 'CITY', price: 500000, rent: 40000, houseRent: 120000, hotelRent: 240000, color: '#e74c3c', flag: '🇹🇷' },

  // Top row (18–27): left to right
  { id: 18, name: '우주여행', type: 'TRAVEL', description: '우주여행! 임의의 칸으로 이동합니다' },
  { id: 19, name: '모스크바', type: 'CITY', price: 550000, rent: 45000, houseRent: 135000, hotelRent: 270000, color: '#3498db', flag: '🇷🇺' },
  { id: 20, name: '황금열쇠', type: 'KEY' },
  { id: 21, name: '아테네', type: 'CITY', price: 600000, rent: 50000, houseRent: 150000, hotelRent: 300000, color: '#e67e22', flag: '🇬🇷' },
  { id: 22, name: '파리', type: 'CITY', price: 700000, rent: 60000, houseRent: 180000, hotelRent: 360000, color: '#9b59b6', flag: '🇫🇷' },
  { id: 23, name: '황금열쇠', type: 'KEY' },
  { id: 24, name: '런던', type: 'CITY', price: 750000, rent: 65000, houseRent: 195000, hotelRent: 390000, color: '#1abc9c', flag: '🇬🇧' },
  { id: 25, name: '세금', type: 'TAX', description: '소득세 납부! 현금의 10% 납부' },
  { id: 26, name: '베를린', type: 'CITY', price: 680000, rent: 55000, houseRent: 165000, hotelRent: 330000, color: '#e74c3c', flag: '🇩🇪' },
  { id: 27, name: '사회복지기금', type: 'WELFARE', description: '행운! 사회복지기금에서 50만원 수령' },

  // Right column (28–35): top to bottom
  { id: 28, name: '마드리드', type: 'CITY', price: 650000, rent: 53000, houseRent: 159000, hotelRent: 318000, color: '#3498db', flag: '🇪🇸' },
  { id: 29, name: '로마', type: 'CITY', price: 700000, rent: 60000, houseRent: 180000, hotelRent: 360000, color: '#e67e22', flag: '🇮🇹' },
  { id: 30, name: '황금열쇠', type: 'KEY' },
  { id: 31, name: '리우데자네이루', type: 'CITY', price: 600000, rent: 50000, houseRent: 150000, hotelRent: 300000, color: '#9b59b6', flag: '🇧🇷' },
  { id: 32, name: '시드니', type: 'CITY', price: 720000, rent: 62000, houseRent: 186000, hotelRent: 372000, color: '#1abc9c', flag: '🇦🇺' },
  { id: 33, name: '황금열쇠', type: 'KEY' },
  { id: 34, name: '뉴욕', type: 'CITY', price: 800000, rent: 70000, houseRent: 210000, hotelRent: 420000, color: '#e74c3c', flag: '🇺🇸' },
  { id: 35, name: '라스베이거스', type: 'CITY', price: 750000, rent: 65000, houseRent: 195000, hotelRent: 390000, color: '#3498db', flag: '🇺🇸' },
];

export const TOTAL_TILES = BOARD_TILES.length; // 36

export const GOLDEN_KEY_EVENTS = [
  { id: 1, title: '은행 오류!', description: '은행 실수로 200,000원을 받습니다.', effect: { type: 'money', amount: 200000 } },
  { id: 2, title: '세금 환급!', description: '세금 환급으로 100,000원을 받습니다.', effect: { type: 'money', amount: 100000 } },
  { id: 3, title: '여행 경비', description: '여행 경비로 150,000원을 지불합니다.', effect: { type: 'money', amount: -150000 } },
  { id: 4, title: '로또 당첨!', description: '로또에 당첨되어 500,000원을 받습니다.', effect: { type: 'money', amount: 500000 } },
  { id: 5, title: '의료비 지출', description: '갑작스러운 의료비 200,000원을 지불합니다.', effect: { type: 'money', amount: -200000 } },
  { id: 6, title: '출발로 이동!', description: '출발 칸으로 이동하고 200,000원을 받습니다.', effect: { type: 'move', position: 0, bonus: 200000 } },
  { id: 7, title: '무인도 직행!', description: '즉시 무인도로 이동합니다.', effect: { type: 'move', position: 9 } },
  { id: 8, title: '주식 투자 성공!', description: '주식 투자로 300,000원을 받습니다.', effect: { type: 'money', amount: 300000 } },
  { id: 9, title: '파티 개최', description: '생일 파티를 열어 각 플레이어에게 50,000원을 지급합니다.', effect: { type: 'pay_all', amount: 50000 } },
  { id: 10, title: '배당금 수령', description: '모든 플레이어로부터 각각 50,000원을 받습니다.', effect: { type: 'collect_all', amount: 50000 } },
];

export const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
export const PLAYER_ICONS = ['♟', '♙', '♖', '♗'];
export const INITIAL_MONEY = 2000000;
