import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
import {
  Menu,
  X,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Camera,
  Plus,
  Map as MapIcon,
  Image as ImageIcon,
  Check,
  Share2,
  Compass,
  Utensils,
  Car,
  Bed,
  Info,
  Banknote,
  LogOut,
  Search,
  Heart,
  ExternalLink,
  User,
  Trash2,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Activity,
  Copy,
  Edit,
  Edit2,
  Sparkles,
  ChevronLeft,
  Bell,
  FileText,
  MoreVertical,
  MessageCircle,
  Navigation,
  Flag,
  MessageSquare,
  XCircle,
} from 'lucide-react';

// --- エラー復旧用の境界（ErrorBoundary） ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-center text-white">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">
            画面の読み込みエラーが発生しました
          </h2>
          <p className="text-sm text-stone-400 mb-6">
            古いデータとの不整合が起きている可能性があります。
            <br />
            下のボタンを押してデータをリセットしてください。
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
          >
            データをリセットして最初から始める
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Theme & Constants ---
const PRESET_COLORS = ['#7A9D8C', '#E2A98B', '#8FA8C8', '#D4B886', '#B0A3D4'];
const REGIONS = [
  '北海道・東北',
  '関東',
  '中部',
  '関西',
  '中国・四国',
  '九州・沖縄',
];
const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

const FEMALE_AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Mimi&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Hana&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Rin&backgroundColor=eaf0ed',
];
const MALE_AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Max&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Sam&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Ken&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Ren&backgroundColor=eaf0ed',
];

const MOCK_STATIONS = [
  {
    name: '東京駅 (JR山手線など)',
    yomi: 'とうきょう トウキョウ tokyo',
    city: '千代田区',
  },
  {
    name: '新宿駅 (JR山手線など)',
    yomi: 'しんじゅく シンジュク shinjuku',
    city: '新宿区',
  },
  {
    name: '渋谷駅 (JR山手線など)',
    yomi: 'しぶや シブヤ shibuya',
    city: '渋谷区',
  },
  {
    name: '池袋駅 (JR山手線など)',
    yomi: 'いけぶくろ イケブクロ ikebukuro',
    city: '豊島区',
  },
  {
    name: '恵比寿駅 (JR山手線など)',
    yomi: 'えびす エビス ebisu',
    city: '渋谷区',
  },
  {
    name: '品川駅 (JR山手線など)',
    yomi: 'しながわ シナガワ shinagawa',
    city: '港区',
  },
  { name: '上野駅 (JR山手線など)', yomi: 'うえの ウエノ ueno', city: '台東区' },
  {
    name: '横浜駅 (JR東海道本線など)',
    yomi: 'よこはま ヨコハマ yokohama',
    city: '横浜市',
  },
  {
    name: '名古屋駅 (JR東海道新幹線など)',
    yomi: 'なごや ナゴヤ nagoya',
    city: '名古屋市',
  },
  {
    name: '京都駅 (JR東海道本線など)',
    yomi: 'きょうと キョウト kyoto',
    city: '京都市',
  },
  {
    name: '大阪駅 (JR大阪環状線など)',
    yomi: 'おおさか オオサカ osaka',
    city: '大阪市',
  },
  { name: '梅田駅 (阪急線など)', yomi: 'うめだ ウメダ umeda', city: '大阪市' },
  {
    name: '難波駅 (南海線など)',
    yomi: 'なんば ナンバ nanba namba',
    city: '大阪市',
  },
  {
    name: '博多駅 (JR鹿児島本線など)',
    yomi: 'はかた ハカタ hakata',
    city: '福岡市',
  },
  {
    name: '札幌駅 (JR函館本線など)',
    yomi: 'さっぽろ サッポロ sapporo',
    city: '札幌市',
  },
  {
    name: '松本駅 (JR篠ノ井線など)',
    yomi: 'まつもと マツモト matsumoto',
    city: '松本市',
  },
  {
    name: '島内駅 (JR大糸線)',
    yomi: 'しまうち シマウチ shimauchi',
    city: '松本市',
  },
];

const QUICK_TAGS = [
  { id: 'transport', label: '移動', icon: Car, defaultTitle: '車・電車移動' },
  {
    id: 'meal',
    label: 'ごはん',
    icon: Utensils,
    defaultTitle: 'ランチ・ディナー',
  },
  {
    id: 'sightseeing',
    label: '観光',
    icon: Camera,
    defaultTitle: '観光スポット巡り',
  },
  {
    id: 'active',
    label: '体験',
    icon: Activity,
    defaultTitle: '体験・アクティビティ',
  },
  { id: 'hotel', label: '宿', icon: Bed, defaultTitle: 'ホテルチェックイン' },
];

const EXTRA_PUBLIC_TRIP_TEMPLATES = [
  {
    title: '金沢・ひがし茶屋街と海鮮づくしの旅',
    description:
      '近江町市場で朝ごはんを食べて、兼六園や21世紀美術館を巡る王道1泊2日プラン！',
    destination: '石川県',
    region: '中部',
    authorId: 'm4',
    authorName: '北陸さんぽ',
    authorAvatar: FEMALE_AVATARS[3],
    authorBio: '北陸の美味しい海鮮と和菓子を探して旅しています🍣',
    covers: [
      'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80',
    ],
    events: [
      {
        id: 'ex_k1',
        date: '2026-11-12',
        time: '10:30',
        title: '近江町市場でのどぐろ・海鮮丼ランチ',
        type: 'meal',
        cost: 3500,
        status: 'approved',
        authorId: 'm4',
        location: '近江町市場',
      },
      {
        id: 'ex_k2',
        date: '2026-11-12',
        time: '13:00',
        title: '兼六園＆金沢城公園 散策',
        type: 'sightseeing',
        cost: 800,
        status: 'approved',
        authorId: 'm4',
        location: '兼六園',
      },
      {
        id: 'ex_k3',
        date: '2026-11-12',
        time: '15:00',
        title: 'ひがし茶屋街で金箔ソフト＆和カフェ',
        type: 'meal',
        cost: 1600,
        status: 'approved',
        authorId: 'm4',
        location: 'ひがし茶屋街',
      },
      {
        id: 'ex_k4',
        date: '2026-11-12',
        time: '18:00',
        title: '金沢町家ホテル宿泊',
        type: 'hotel',
        cost: 14000,
        status: 'approved',
        authorId: 'm4',
        location: '金沢駅周辺',
      },
      {
        id: 'ex_k5',
        date: '2026-11-13',
        time: '10:30',
        title: '金沢21世紀美術館 鑑賞',
        type: 'sightseeing',
        cost: 1200,
        status: 'approved',
        authorId: 'm4',
        location: '金沢21世紀美術館',
      },
    ],
  },
  {
    title: '沖縄・宮古ブルーに癒やされる南国ドライブ',
    description:
      '伊良部大橋を渡って絶景ビーチ巡り！マンゴースイーツも外せません。',
    destination: '沖縄県',
    region: '九州・沖縄',
    authorId: 'm5',
    authorName: 'ちゅら旅',
    authorAvatar: MALE_AVATARS[2],
    authorBio: '離島と青い海が大好き！年に3回は沖縄に行きます🌺',
    covers: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    ],
    events: [
      {
        id: 'ex_o1',
        date: '2026-11-12',
        time: '11:00',
        title: '宮古空港でレンタカー出発＆伊良部大橋ドライブ',
        type: 'transport',
        cost: 4500,
        status: 'approved',
        authorId: 'm5',
        location: '伊良部大橋',
      },
      {
        id: 'ex_o2',
        date: '2026-11-12',
        time: '12:30',
        title: '宮古そば＆ソーキそばランチ',
        type: 'meal',
        cost: 1100,
        status: 'approved',
        authorId: 'm5',
        location: '古謝そば屋',
      },
      {
        id: 'ex_o3',
        date: '2026-11-12',
        time: '14:30',
        title: '与那覇前浜ビーチ＆ウミガメシュノーケル体験',
        type: 'active',
        cost: 6500,
        status: 'approved',
        authorId: 'm5',
        location: '与那覇前浜ビーチ',
      },
      {
        id: 'ex_o4',
        date: '2026-11-12',
        time: '18:00',
        title: 'オーシャンビューリゾートホテル宿泊',
        type: 'hotel',
        cost: 18000,
        status: 'approved',
        authorId: 'm5',
        location: '宮古島',
      },
      {
        id: 'ex_o5',
        date: '2026-11-13',
        time: '13:00',
        title: '完熟マンゴーパフェ＆南国カフェ',
        type: 'meal',
        cost: 1800,
        status: 'approved',
        authorId: 'm5',
        location: 'ユートピアファーム宮古島',
      },
    ],
  },
  {
    title: '広島・尾道レトロ坂道＆しまなみ海道サイクリング',
    description:
      '瀬戸内海の島々を自転車で駆け抜ける爽快旅！尾道ラーメンも堪能しました。',
    destination: '広島県',
    region: '中国・四国',
    authorId: 'm6',
    authorName: 'せとうちライダー',
    authorAvatar: MALE_AVATARS[3],
    authorBio: '自転車と一緒に全国の海沿いを走っています🚲',
    covers: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    ],
    events: [
      {
        id: 'ex_h1',
        date: '2026-11-12',
        time: '10:00',
        title: '尾道駅前でレンタサイクル貸出',
        type: 'active',
        cost: 3000,
        status: 'approved',
        authorId: 'm6',
        location: '尾道駅',
      },
      {
        id: 'ex_h2',
        date: '2026-11-12',
        time: '12:00',
        title: '本場の尾道ラーメンランチ',
        type: 'meal',
        cost: 950,
        status: 'approved',
        authorId: 'm6',
        location: '尾道商店街',
      },
      {
        id: 'ex_h3',
        date: '2026-11-12',
        time: '14:00',
        title: '千光寺山ロープウェイ＆猫の細道散策',
        type: 'sightseeing',
        cost: 700,
        status: 'approved',
        authorId: 'm6',
        location: '千光寺',
      },
      {
        id: 'ex_h4',
        date: '2026-11-12',
        time: '17:30',
        title: '瀬戸内海ビューのサイクリスト向けホテル宿泊',
        type: 'hotel',
        cost: 12000,
        status: 'approved',
        authorId: 'm6',
        location: 'ONOMICHI U2',
      },
    ],
  },
  {
    title: '軽井沢・森のカフェとアウトレット週末旅',
    description:
      '東京から新幹線で1時間！緑に囲まれたテラス席でモーニングを楽しむ大人の休日。',
    destination: '長野県',
    region: '中部',
    authorId: 'm7',
    authorName: '高原カフェ部',
    authorAvatar: FEMALE_AVATARS[4],
    authorBio: '信州のカフェとパン屋さん巡りが趣味です🥐',
    covers: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    ],
    events: [
      {
        id: 'ex_ka1',
        date: '2026-11-12',
        time: '09:30',
        title: 'ベーカリー＆レストラン沢村で高原モーニング',
        type: 'meal',
        cost: 2200,
        status: 'approved',
        authorId: 'm7',
        location: 'ベーカリー＆レストラン沢村 旧軽井沢',
      },
      {
        id: 'ex_ka2',
        date: '2026-11-12',
        time: '11:30',
        title: '白糸の滝＆旧軽井沢銀座通り食べ歩き',
        type: 'sightseeing',
        cost: 1500,
        status: 'approved',
        authorId: 'm7',
        location: '旧軽井沢銀座通り',
      },
      {
        id: 'ex_ka3',
        date: '2026-11-12',
        time: '14:30',
        title: 'ハルニレテラスで丸山珈琲＆川辺散策',
        type: 'meal',
        cost: 1400,
        status: 'approved',
        authorId: 'm7',
        location: 'ハルニレテラス',
      },
      {
        id: 'ex_ka4',
        date: '2026-11-12',
        time: '17:00',
        title: '軽井沢の森リゾートホテル宿泊',
        type: 'hotel',
        cost: 16500,
        status: 'approved',
        authorId: 'm7',
        location: '軽井沢',
      },
    ],
  },
];

const initialPublicTrips = [
  {
    id: 'PUB-1',
    title: '秋の京都・絶景アクティブ旅',
    description:
      '秋の京都を満喫するアクティブなプラン！紅葉の絶景スポットを巡りつつ、保津川下りも。',
    destination: '京都府',
    region: '関西',
    authorId: 'm1',
    authorName: 'アクティブ夫婦',
    authorAvatar: FEMALE_AVATARS[0],
    authorBio: '週末は全国の絶景とアクティビティを求めて夫婦で旅しています！',
    likes: 342,
    views: 1420,
    likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    ],
    startDate: '2026-11-12',
    endDate: '2026-11-14',
    budget: 31800,
    publishedAt: Date.now() - 28 * 24 * 60 * 60 * 1000,
    members: [{ id: 'm1', name: 'アクティブ夫婦', color: '#8FA8C8' }],
    comments: [
      {
        id: 'c1',
        text: '最高ですね！',
        authorName: 'たびたろう',
        authorAvatar: MALE_AVATARS[1],
        createdAt: Date.now() - 86400000,
      },
    ],
    events: [
      {
        id: 'e1',
        date: '2026-11-12',
        time: '10:30',
        title: '京都駅到着・バス1日券購入',
        type: 'transport',
        cost: 700,
        status: 'approved',
        authorId: 'm1',
        location: '京都駅',
        photos: [],
      },
      {
        id: 'e2',
        date: '2026-11-12',
        time: '11:45',
        title: '南禅寺 順正で湯豆腐ランチ',
        type: 'meal',
        cost: 3500,
        status: 'approved',
        authorId: 'm1',
        location: '南禅寺',
        photos: [
          {
            id: 'pe_1',
            url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
            authorId: 'm1',
            authorName: 'アクティブ夫婦',
            isPublic: true,
          },
        ],
      },
      {
        id: 'e3',
        date: '2026-11-12',
        time: '14:00',
        title: '永観堂・紅葉ライトアップ拝観',
        type: 'sightseeing',
        cost: 1000,
        status: 'approved',
        authorId: 'm1',
        location: '永観堂',
        photos: [
          {
            id: 'pe_2',
            url: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&w=800&q=80',
            authorId: 'm1',
            authorName: 'アクティブ夫婦',
            isPublic: true,
          },
          {
            id: 'pe_3',
            url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
            authorId: 'm1',
            authorName: 'アクティブ夫婦',
            isPublic: true,
          },
        ],
      },
      {
        id: 'e4',
        date: '2026-11-12',
        time: '17:30',
        title: '嵐山温泉 宿チェックイン（1泊2食）',
        type: 'hotel',
        cost: 18000,
        status: 'approved',
        authorId: 'm1',
        location: '嵐山温泉',
        photos: [],
      },
      {
        id: 'e5',
        date: '2026-11-13',
        time: '10:00',
        title: '保津川下り体験',
        type: 'active',
        cost: 6000,
        status: 'approved',
        authorId: 'm1',
        location: '保津川下り乗船場',
        photos: [],
      },
      {
        id: 'e6',
        date: '2026-11-13',
        time: '13:00',
        title: '嵐山よしむらで手打ち蕎麦ランチ',
        type: 'meal',
        cost: 2600,
        status: 'approved',
        authorId: 'm1',
        location: '嵐山',
        photos: [],
      },
    ],
  },
  {
    id: 'PUB-2',
    title: '箱根温泉・リラックス週末旅',
    description:
      '日頃の疲れを癒やす箱根温泉旅行。美味しいご飯と貸切露天風呂で最高の休日を！',
    destination: '神奈川県',
    region: '関東',
    authorId: 'm2',
    authorName: 'たびたろう',
    authorAvatar: MALE_AVATARS[1],
    authorBio: '温泉と美味しいお酒が大好き。関東近郊のんびり旅メインです♨️',
    likes: 128,
    views: 890,
    likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    ],
    startDate: '2026-12-05',
    endDate: '2026-12-06',
    budget: 29300,
    publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    members: [{ id: 'm2', name: 'たびたろう', color: '#E2A98B' }],
    comments: [],
    events: [
      {
        id: 'e21',
        date: '2026-12-05',
        time: '11:00',
        title: '箱根湯本駅到着・食べ歩き',
        type: 'meal',
        cost: 1200,
        status: 'approved',
        authorId: 'm2',
        location: '箱根湯本駅',
        photos: [],
      },
      {
        id: 'e22',
        date: '2026-12-05',
        time: '12:30',
        title: 'はつ花そば 本店で自然薯そば',
        type: 'meal',
        cost: 1800,
        status: 'approved',
        authorId: 'm2',
        location: 'はつ花そば',
        photos: [],
      },
      {
        id: 'e23',
        date: '2026-12-05',
        time: '14:30',
        title: '彫刻の森美術館',
        type: 'sightseeing',
        cost: 2000,
        status: 'approved',
        authorId: 'm2',
        location: '彫刻の森美術館',
        photos: [],
      },
      {
        id: 'e24',
        date: '2026-12-05',
        time: '16:30',
        title: '強羅温泉 露天風呂付き宿に宿泊',
        type: 'hotel',
        cost: 21000,
        status: 'approved',
        authorId: 'm2',
        location: '強羅温泉',
        photos: [
          {
            id: 'pe_24',
            url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
            authorId: 'm2',
            authorName: 'たびたろう',
            isPublic: true,
          },
        ],
      },
      {
        id: 'e25',
        date: '2026-12-06',
        time: '10:30',
        title: '大涌谷ロープウェイ＆黒たまご',
        type: 'sightseeing',
        cost: 1500,
        status: 'approved',
        authorId: 'm2',
        location: '大涌谷',
        photos: [],
      },
      {
        id: 'e26',
        date: '2026-12-06',
        time: '12:30',
        title: '芦ノ湖畔ベーカリーカフェでランチ',
        type: 'meal',
        cost: 1800,
        status: 'approved',
        authorId: 'm2',
        location: '芦ノ湖',
        photos: [],
      },
    ],
  },
  {
    id: 'PUB-3',
    title: '弾丸！札幌グルメ食べ尽くし',
    description:
      '海鮮丼、ジンギスカン、シメパフェまで！1泊2日でとにかく美味しいものを食べる旅。',
    destination: '北海道',
    region: '北海道・東北',
    authorId: 'm3',
    authorName: 'くいしんぼう',
    authorAvatar: FEMALE_AVATARS[2],
    authorBio: '食べるために旅をする！全国のローカルグルメ・カフェを開拓中🍰',
    likes: 89,
    views: 560,
    likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
    ],
    startDate: '2027-01-10',
    endDate: '2027-01-11',
    budget: 23500,
    publishedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    members: [{ id: 'm3', name: 'くいしんぼう', color: '#7A9D8C' }],
    comments: [],
    events: [
      {
        id: 'e31',
        date: '2027-01-10',
        time: '11:30',
        title: '二条市場で特選ウニ・イクラ海鮮丼',
        type: 'meal',
        cost: 3400,
        status: 'approved',
        authorId: 'm3',
        location: '札幌二条市場',
      },
      {
        id: 'e32',
        date: '2027-01-10',
        time: '14:30',
        title: '白い恋人パーク見学＆ソフトクリーム',
        type: 'sightseeing',
        cost: 1500,
        status: 'approved',
        authorId: 'm3',
        location: '白い恋人パーク',
      },
      {
        id: 'e33',
        date: '2027-01-10',
        time: '18:30',
        title: 'サッポロビール園で生ラムジンギスカン',
        type: 'meal',
        cost: 4800,
        status: 'approved',
        authorId: 'm3',
        location: 'サッポロビール園',
      },
      {
        id: 'e34',
        date: '2027-01-10',
        time: '21:00',
        title: '夜パフェ専門店で札幌シメパフェ',
        type: 'meal',
        cost: 2000,
        status: 'approved',
        authorId: 'm3',
        location: 'すすきの',
      },
      {
        id: 'e35',
        date: '2027-01-10',
        time: '22:30',
        title: '札幌市内ホテル宿泊（大浴場付き）',
        type: 'hotel',
        cost: 10000,
        status: 'approved',
        authorId: 'm3',
        location: '札幌駅周辺',
      },
      {
        id: 'e36',
        date: '2027-01-11',
        time: '11:30',
        title: 'スープカレーGARAKUでランチ',
        type: 'meal',
        cost: 1800,
        status: 'approved',
        authorId: 'm3',
        location: 'スープカレーGARAKU',
      },
    ],
  },
];

const initialNotifications = [
  {
    id: 'n1',
    type: 'like',
    message: '温泉ボーイさんがあなたの旅にいいねしました。',
    createdAt: Date.now() - 3600000,
    read: false,
  },
];

// --- Utils ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateTripCode = () =>
  'TABI-' + Math.random().toString(36).substr(2, 8).toUpperCase();
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
};
const safeParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

// 古いキャッシュデータを安全な最新構造に自動修復する関数
const sanitizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;
  return {
    ...user,
    id: user.id || 'dev_user',
    name: user.name || 'たびたろう',
    password: user.password || (user.isGuest ? '' : 'password123'),
    passkeys: Array.isArray(user.passkeys) ? user.passkeys : [],
    following: Array.isArray(user.following) ? user.following : ['m1'],
    followers: Array.isArray(user.followers) ? user.followers : ['m2', 'm3'],
    autoMinimizeTrip:
      user.autoMinimizeTrip !== undefined ? user.autoMinimizeTrip : true,
  };
};

const sanitizePublicTrips = (list) => {
  if (!Array.isArray(list) || list.length === 0) return initialPublicTrips;
  const allPresets = [...initialPublicTrips, ...EXTRA_PUBLIC_TRIP_TEMPLATES];
  return list.map((t, idx) => {
    const fallbackAuthorId =
      t.authorName === 'アクティブ夫婦'
        ? 'm1'
        : t.authorName === 'たびたろう'
        ? 'm2'
        : t.authorName === 'くいしんぼう'
        ? 'm3'
        : `author_${idx}`;
    const presetMatch = allPresets.find(
      (p) => (p.id && p.id === t.id) || p.title === t.title
    );
    const resolvedEvents =
      Array.isArray(t.events) && t.events.some((e) => Number(e.cost) > 0)
        ? t.events
        : presetMatch
        ? presetMatch.events.map((ev) => ({
            ...ev,
            date: t.startDate || ev.date,
          }))
        : Array.isArray(t.events)
        ? t.events
        : [];
    const eventsTotalCost = resolvedEvents.reduce(
      (sum, e) => sum + (Number(e.cost) || 0),
      0
    );
    return {
      ...t,
      authorId: t.authorId || t.members?.[0]?.id || fallbackAuthorId,
      likedBy: Array.isArray(t.likedBy) ? t.likedBy : [],
      comments: Array.isArray(t.comments) ? t.comments : [],
      covers: Array.isArray(t.covers)
        ? t.covers
        : Array.isArray(t.images)
        ? t.images
        : [],
      events: resolvedEvents,
      budget: eventsTotalCost > 0 ? eventsTotalCost : t.budget || 0,
    };
  });
};

let globalSetToast = null;
const customAlert = (msg) => {
  if (globalSetToast) globalSetToast(msg);
};

const copyToClipboard = (text, successMessage) => {
  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const ok = document.execCommand('copy');
      if (ok) customAlert(successMessage);
      else
        customAlert(
          'コピーできませんでした。コードを長押し・選択してコピーしてください'
        );
    } catch (e) {
      customAlert(
        'コピーできませんでした。コードを長押し・選択してコピーしてください'
      );
    }
    textArea.remove();
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        customAlert(successMessage);
      })
      .catch(() => {
        fallbackCopy();
      });
  } else {
    fallbackCopy();
  }
};

const generateSuggests = (baseName, emailBase) => {
  let base = baseName.trim() ? baseName : emailBase || '';
  const kanaMap = {
    あ: 'a',
    い: 'i',
    う: 'u',
    え: 'e',
    お: 'o',
    か: 'ka',
    き: 'ki',
    く: 'ku',
    け: 'ke',
    こ: 'ko',
    さ: 'sa',
    し: 'shi',
    す: 'su',
    せ: 'se',
    そ: 'so',
    た: 'ta',
    ち: 'chi',
    つ: 'tsu',
    て: 'te',
    と: 'to',
    な: 'na',
    に: 'ni',
    ぬ: 'nu',
    ね: 'ne',
    の: 'no',
    は: 'ha',
    ひ: 'hi',
    ふ: 'fu',
    へ: 'he',
    ほ: 'ho',
    ま: 'ma',
    み: 'mi',
    む: 'mu',
    め: 'me',
    も: 'mo',
    や: 'ya',
    ゆ: 'yu',
    よ: 'yo',
    ら: 'ra',
    り: 'ri',
    る: 'ru',
    れ: 're',
    ろ: 'ro',
    わ: 'wa',
    を: 'wo',
    ん: 'n',
    ー: '-',
  };
  let romaji = '';
  for (let c of base) {
    romaji += kanaMap[c] || c;
  }
  romaji = romaji.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
  return [
    `${romaji}_${Math.floor(Math.random() * 1000)}`,
    `${romaji}_travel`,
    `tabi_${romaji}`,
  ];
};

// 駅データAPI（HeartRails Express）を組み込んだ検索コンポーネント
function StationSearchInput({
  value,
  onChange,
  cityContext = '',
  prefectureContext = '',
}) {
  const [query, setQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const kanaToHira = (str) =>
    str.replace(/[\u30a1-\u30f6]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) - 0x60)
    );

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    if (trimmed === value) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchWord = trimmed.replace(/駅$/, '');
        let apiUrl = `https://express.heartrails.com/api/json?method=getStations&name=${encodeURIComponent(
          searchWord
        )}`;
        if (prefectureContext && prefectureContext !== '未設定') {
          apiUrl += `&prefecture=${encodeURIComponent(prefectureContext)}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data?.response?.station && data.response.station.length > 0) {
          const sorted = [...data.response.station].sort((a, b) => {
            if (!cityContext) return 0;
            const aMatch =
              (a.postal || '').includes(cityContext) ||
              (a.prefecture || '').includes(cityContext)
                ? 1
                : 0;
            const bMatch =
              (b.postal || '').includes(cityContext) ||
              (b.prefecture || '').includes(cityContext)
                ? 1
                : 0;
            return bMatch - aMatch;
          });
          const formatted = sorted.map(
            (s) => `${s.name}駅 (${s.line} / ${s.prefecture})`
          );
          setSuggestions(Array.from(new Set(formatted)).slice(0, 8));
          setShowDropdown(true);
        } else {
          fallbackSearch(trimmed);
        }
      } catch (error) {
        fallbackSearch(trimmed);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, prefectureContext, cityContext]);

  const fallbackSearch = (val) => {
    const lowerVal = val.toLowerCase();
    const hiraVal = kanaToHira(lowerVal);
    const localMatches = MOCK_STATIONS.filter(
      (s) =>
        s.name.includes(val) ||
        s.yomi.includes(lowerVal) ||
        s.yomi.includes(hiraVal)
    ).map((s) => s.name);

    const results =
      localMatches.length > 0 ? localMatches : [`${val.replace(/駅$/, '')}駅`];
    setSuggestions(Array.from(new Set(results)).slice(0, 5));
    setShowDropdown(true);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) onChange('');
  };

  const handleSelect = (stationLabel) => {
    const cleanName = stationLabel.split(' (')[0];
    setQuery(cleanName);
    onChange(cleanName);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="最寄り駅を検索 (例: 島内 / 渋谷)"
          className="w-full p-3 pr-10 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-stone-200 border-t-[#7A9D8C] rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-stone-200 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto animate-in fade-in zoom-in-95">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onMouseDown={() => handleSelect(s)}
              className="p-3 border-b border-stone-50 hover:bg-stone-50 cursor-pointer text-stone-700 font-bold text-xs flex items-center justify-between"
            >
              <span>{s}</span>
              <span className="text-[10px] text-[#7A9D8C]">選択</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const UserAvatar = ({ user, size = 'w-8 h-8' }) => {
  if (user?.avatar)
    return (
      <img
        src={user.avatar}
        alt="avatar"
        className={`${size} rounded-full object-cover border-2 border-white shadow-sm bg-stone-100 shrink-0`}
      />
    );
  return (
    <div
      className={`${size} rounded-full border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0`}
      style={{ backgroundColor: user?.color || '#7A9D8C' }}
    >
      {user?.name?.charAt(0) || '👤'}
    </div>
  );
};

// ==========================================
// Root App Component
// ==========================================
// ★開発用スイッチ：trueにするとログイン画面をスキップします（元に戻す時は false に変更してください）
const DEV_AUTO_LOGIN = true;

const DEV_DEFAULT_USER = {
  id: 'dev_user',
  name: 'たびたろう（開発用）',
  bio: '長野県を拠点に、週末のドライブや温泉旅行を計画しています！',
  email: 'dev@example.com',
  password: 'password123',
  passkeys: [],
  residence: '長野県',
  city: '松本市',
  station: '松本駅',
  avatar: MALE_AVATARS[0],
  isGuest: false,
  following: ['m1'],
  followers: ['m2', 'm3'],
  autoMinimizeTrip: true,
};

const INITIAL_SAMPLE_TRIPS = [
  {
    id: 'TABI-KYOTO26',
    title: '秋の京都・古都めぐりと紅葉ライトアップ旅',
    destination: '京都府',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    budget: 45000,
    members: [
      {
        id: 'dev_user',
        name: 'たびたろう',
        color: '#7A9D8C',
        avatar: MALE_AVATARS[0],
      },
      { id: 'm1', name: 'はなこ', color: '#E2A98B', avatar: FEMALE_AVATARS[0] },
    ],
    isSoloTrip: false,
    events: [
      {
        id: 'ky_1',
        date: '2026-11-20',
        time: '10:00',
        title: '京都駅集合・コインロッカーへ荷物預け',
        type: 'transport',
        location: '京都駅',
        cost: 700,
        status: 'approved',
        authorId: 'dev_user',
        memo: '中央口改札前で待ち合わせ。バス1日券も購入する。',
        photos: [],
      },
      {
        id: 'ky_2',
        date: '2026-11-20',
        time: '11:45',
        title: '南禅寺 順正で名物・湯豆腐ランチ',
        type: 'meal',
        location: '南禅寺 順正',
        cost: 3500,
        status: 'approved',
        authorId: 'dev_user',
        memo: '予約名：召田（11:45〜2名）庭園側の席をリクエスト済み',
        photos: [
          {
            id: 'ph_ev1',
            url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
            authorId: 'dev_user',
            authorName: 'たびたろう',
            createdAt: '2026-11-20',
            isPublic: true,
          },
        ],
      },
      {
        id: 'ky_3',
        date: '2026-11-20',
        time: '14:00',
        title: '永観堂＆南禅寺 水路閣で紅葉撮影',
        type: 'sightseeing',
        location: '永観堂 禅林寺',
        cost: 1000,
        status: 'approved',
        authorId: 'm1',
        memo: '水路閣のレンガアーチで写真を撮る！',
        photos: [
          {
            id: 'ph_1',
            url: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&w=800&q=80',
            authorId: 'dev_user',
            authorName: 'たびたろう',
            createdAt: '2026-11-20',
            isPublic: true,
          },
          {
            id: 'ph_2',
            url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
            authorId: 'm1',
            authorName: 'はなこ',
            createdAt: '2026-11-21',
            isPublic: true,
          },
        ],
      },
      {
        id: 'ky_4',
        date: '2026-11-20',
        time: '15:30',
        title: 'ぎおん徳屋で本わらびもち休憩',
        type: 'meal',
        location: 'ぎおん徳屋',
        cost: 1500,
        status: 'proposed',
        authorId: 'm1',
        memo: '行列次第でテイクアウトに切り替えるかも',
        photos: [],
      },
      {
        id: 'ky_5',
        date: '2026-11-20',
        time: '17:30',
        title: '京都嵐山温泉 花伝抄 チェックイン',
        type: 'hotel',
        location: '京都嵐山温泉 花伝抄',
        cost: 18000,
        status: 'approved',
        authorId: 'dev_user',
        memo: '5つの貸切露天風呂あり。22時半から夜鳴きそば無料サービス！',
        photos: [],
      },
      {
        id: 'ky_6',
        date: '2026-11-21',
        time: '09:30',
        title: '朝の竹林の小径＆渡月橋さんぽ',
        type: 'sightseeing',
        location: '嵐山 竹林の小径',
        cost: 0,
        status: 'approved',
        authorId: 'dev_user',
        memo: '人が少ない朝のうちに散策',
        photos: [],
      },
      {
        id: 'ky_7',
        date: '2026-11-21',
        time: '12:00',
        title: '嵐山よしむらで渡月橋ビュー手打ち蕎麦',
        type: 'meal',
        location: '嵐山よしむら',
        cost: 2400,
        status: 'approved',
        authorId: 'm1',
        memo: '',
        photos: [],
      },
      {
        id: 'ky_8',
        date: '2026-11-22',
        time: '11:00',
        title: '錦市場で食べ歩き＆おみやげ購入',
        type: 'sightseeing',
        location: '錦市場',
        cost: 3000,
        status: 'approved',
        authorId: 'dev_user',
        memo: 'だし巻き玉子と京漬物をチェック',
        photos: [],
      },
    ],
    packingList: [
      {
        id: 'pk_1',
        title: 'モバイルバッテリー＆充電ケーブル',
        category: 'personal',
        ownerId: 'dev_user',
        checked: true,
        checkedBy: { dev_user: true },
      },
      {
        id: 'pk_2',
        title: '御朱印帳',
        category: 'personal',
        ownerId: 'dev_user',
        checked: false,
        checkedBy: { dev_user: false },
      },
      {
        id: 'pk_3',
        title: 'カメラ・三脚（小型）',
        category: 'shared',
        checked: true,
        assigneeId: 'dev_user',
        assigneeName: 'たびたろう',
      },
      {
        id: 'pk_4',
        title: 'ウェットティッシュ・ばんそうこう',
        category: 'shared',
        checked: false,
        assigneeId: 'm1',
        assigneeName: 'はなこ',
      },
    ],
    souvenirList: [
      {
        id: 'sv_1',
        target: '職場・学校',
        title: '阿闍梨餅（満月）10個入り',
        amount: 1500,
        purchased: false,
      },
      {
        id: 'sv_2',
        target: '自分用',
        title: '祇園辻利の抹茶菓子セット',
        amount: 2200,
        purchased: true,
      },
    ],
    extraExpenses: [
      {
        id: 'ex_1',
        title: '京都駅コインロッカー代',
        amount: 700,
        category: 'transport',
        paidBy: 'たびたろう',
        createdAt: '2026-11-20',
      },
    ],
    photos: [
      {
        id: 'ph_1',
        url: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&w=800&q=80',
        authorId: 'dev_user',
        authorName: 'たびたろう',
        createdAt: '2026-11-20',
      },
      {
        id: 'ph_2',
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        authorId: 'm1',
        authorName: 'はなこ',
        createdAt: '2026-11-21',
      },
    ],
  },
  {
    id: 'TABI-HAKONE',
    title: '箱根温泉・美術館と貸切露天で癒やし旅',
    destination: '神奈川県・箱根',
    startDate: '2026-12-12',
    endDate: '2026-12-13',
    budget: 35000,
    members: [
      {
        id: 'dev_user',
        name: 'たびたろう',
        color: '#7A9D8C',
        avatar: MALE_AVATARS[0],
      },
    ],
    isSoloTrip: true,
    events: [
      {
        id: 'hk_1',
        date: '2026-12-12',
        time: '10:30',
        title: '箱根湯本駅到着・商店街食べ歩き',
        type: 'meal',
        location: '箱根湯本駅',
        cost: 1200,
        status: 'approved',
        authorId: 'dev_user',
        memo: '箱根まんじゅうと揚げかまぼこ',
        photos: [],
      },
      {
        id: 'hk_2',
        date: '2026-12-12',
        time: '13:30',
        title: '彫刻の森美術館 鑑賞＆足湯',
        type: 'sightseeing',
        location: '彫刻の森美術館',
        cost: 2000,
        status: 'approved',
        authorId: 'dev_user',
        memo: 'ステンドグラスの塔を見る',
        photos: [],
      },
      {
        id: 'hk_3',
        date: '2026-12-12',
        time: '16:00',
        title: '強羅温泉 露天風呂付き宿 チェックイン',
        type: 'hotel',
        location: '強羅温泉',
        cost: 21000,
        status: 'approved',
        authorId: 'dev_user',
        memo: '',
        photos: [],
      },
    ],
    packingList: [],
    souvenirList: [],
    extraExpenses: [],
    photos: [],
  },
];

function TabitabiApp() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sanitizeUser(safeParse('tabitabi_user', null));
    if (saved) return saved;
    return DEV_AUTO_LOGIN ? DEV_DEFAULT_USER : null;
  });
  const [trips, setTrips] = useState(() => {
    const saved = safeParse('tabitabi_trips', null);
    return Array.isArray(saved) && saved.length > 0
      ? saved
      : INITIAL_SAMPLE_TRIPS;
  });
  const [publicTrips, setPublicTrips] = useState(() =>
    sanitizePublicTrips(safeParse('tabitabi_public_trips', initialPublicTrips))
  );
  const [notifications, setNotifications] = useState(() => {
    const saved = safeParse('tabitabi_notifications', initialNotifications);
    return Array.isArray(saved) ? saved : initialNotifications;
  });
  const [refreshCount, setRefreshCount] = useState(0);

  const [activeTripId, setActiveTripId] = useState(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [minimizedTripId, setMinimizedTripId] = useState(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // 画面遷移前のタブやスクロール位置を記憶するステート
  const [dashboardState, setDashboardState] = useState({
    activeTab: 'my',
    discoverSort: 'trending',
    selectedRegion: 'すべて',
    searchQuery: '',
    scrollTop: 0,
    windowScrollY: 0,
  });

  useEffect(() => {
    globalSetToast = (msg) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 3000);
    };
  }, []);

  useEffect(() => {
    if (currentUser)
      localStorage.setItem('tabitabi_user', JSON.stringify(currentUser));
    else localStorage.removeItem('tabitabi_user');
    localStorage.setItem('tabitabi_trips', JSON.stringify(trips));
    localStorage.setItem('tabitabi_public_trips', JSON.stringify(publicTrips));
    localStorage.setItem(
      'tabitabi_notifications',
      JSON.stringify(notifications)
    );
  }, [currentUser, trips, publicTrips, notifications]);

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;

  let activeTrip = trips.find((t) => t.id === activeTripId);
  if (!activeTrip && isReadOnlyMode)
    activeTrip = publicTrips.find((t) => t.id === activeTripId);
  const minimizedTrip = trips.find((t) => t.id === minimizedTripId) || null;

  if (activeTripId && !activeTrip) {
    setActiveTripId(null);
    return null;
  }

  const handleBackFromTrip = () => {
    if (
      !isReadOnlyMode &&
      activeTrip &&
      currentUser?.autoMinimizeTrip !== false
    ) {
      setMinimizedTripId(activeTrip.id);
    }
    setActiveTripId(null);
    setIsReadOnlyMode(false);
  };

  const handleToggleAutoMinimize = () => {
    const nextVal = !(currentUser?.autoMinimizeTrip !== false);
    setCurrentUser({ ...currentUser, autoMinimizeTrip: nextVal });
    if (!nextVal) {
      setMinimizedTripId(null);
    }
    customAlert(
      nextVal
        ? 'しおりを閉じたときの自動ミニ化をONにしました'
        : 'しおりを閉じたときの自動ミニ化をOFFにしました'
    );
  };

  const handlePublishTrip = (publishedData) =>
    setPublicTrips([publishedData, ...publicTrips]);

  const toggleLike = (tripId) => {
    if (currentUser.isGuest) {
      customAlert(
        '「いいね」をするにはアカウント登録が必要です。\n右上のアイコンから登録してください！'
      );
      return;
    }
    setPublicTrips(
      publicTrips.map((t) => {
        if (t.id === tripId) {
          const hasLiked = t.likedBy?.includes(currentUser.id);
          return {
            ...t,
            likes: hasLiked ? t.likes - 1 : t.likes + 1,
            likedBy: hasLiked
              ? (t.likedBy || []).filter((id) => id !== currentUser.id)
              : [...(t.likedBy || []), currentUser.id],
          };
        }
        return t;
      })
    );
  };

  const handleAddComment = (tripId, text) => {
    if (currentUser.isGuest) {
      customAlert('コメントするにはアカウント登録が必要です。');
      return;
    }
    setPublicTrips(
      publicTrips.map((t) => {
        if (t.id === tripId)
          return {
            ...t,
            comments: [
              ...(t.comments || []),
              {
                id: generateId(),
                text,
                authorId: currentUser.id,
                authorName: currentUser.name,
                authorAvatar: currentUser.avatar,
                createdAt: Date.now(),
              },
            ],
          };
        return t;
      })
    );
  };

  const upgradeGuestUser = (newUserData) => {
    setCurrentUser(newUserData);
    const updatedTrips = trips.map((t) => ({
      ...t,
      members: (t.members || []).map((m) =>
        m.id === currentUser.id ? { ...newUserData, color: m.color } : m
      ),
    }));
    setTrips(updatedTrips);
  };

  const handleToggleFollow = (targetAuthorId, targetAuthorName) => {
    if (!targetAuthorId) return;
    if (currentUser.isGuest) {
      customAlert('フォローするにはアカウント登録が必要です。');
      return;
    }
    if (targetAuthorId === currentUser.id) return;

    const followingList = Array.isArray(currentUser.following)
      ? currentUser.following
      : [];
    const isFollowing = followingList.includes(targetAuthorId);
    const nextFollowing = isFollowing
      ? followingList.filter((id) => id !== targetAuthorId)
      : [...followingList, targetAuthorId];

    setCurrentUser({ ...currentUser, following: nextFollowing });
    customAlert(
      isFollowing
        ? `${targetAuthorName || 'ユーザー'}のフォローを解除しました`
        : `${targetAuthorName || 'ユーザー'}をフォローしました！`
    );
  };

  // X風の「引っ張って更新」で新しい投稿を追加＆順番をリフレッシュする処理
  const handleRefreshPublicTrips = () => {
    const today = getTodayString();
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0];
    const EXTRA_FEED_POOL = [
      {
        title: '金沢・ひがし茶屋街と海鮮づくしの旅',
        description:
          '近江町市場で朝ごはんを食べて、兼六園や21世紀美術館を巡る王道1泊2日プラン！',
        destination: '石川県',
        region: '中部',
        authorId: 'm4',
        authorName: '北陸さんぽ',
        authorAvatar: FEMALE_AVATARS[3],
        authorBio: '北陸の美味しい海鮮と和菓子を探して旅しています🍣',
        covers: [
          'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80',
        ],
        events: [
          {
            id: generateId(),
            date: today,
            time: '10:30',
            title: '近江町市場でのどぐろ・海鮮丼ランチ',
            type: 'meal',
            cost: 3500,
            status: 'approved',
            authorId: 'm4',
            location: '近江町市場',
          },
          {
            id: generateId(),
            date: today,
            time: '13:00',
            title: '兼六園＆金沢城公園 散策',
            type: 'sightseeing',
            cost: 800,
            status: 'approved',
            authorId: 'm4',
            location: '兼六園',
          },
          {
            id: generateId(),
            date: today,
            time: '15:00',
            title: 'ひがし茶屋街で金箔ソフト＆和カフェ',
            type: 'meal',
            cost: 1600,
            status: 'approved',
            authorId: 'm4',
            location: 'ひがし茶屋街',
          },
          {
            id: generateId(),
            date: today,
            time: '18:00',
            title: '金沢町家ホテル宿泊',
            type: 'hotel',
            cost: 14000,
            status: 'approved',
            authorId: 'm4',
            location: '金沢駅周辺',
          },
          {
            id: generateId(),
            date: tomorrow,
            time: '10:30',
            title: '金沢21世紀美術館 鑑賞',
            type: 'sightseeing',
            cost: 1200,
            status: 'approved',
            authorId: 'm4',
            location: '金沢21世紀美術館',
          },
        ],
      },
      {
        title: '沖縄・宮古ブルーに癒やされる南国ドライブ',
        description:
          '伊良部大橋を渡って絶景ビーチ巡り！マンゴースイーツも外せません。',
        destination: '沖縄県',
        region: '九州・沖縄',
        authorId: 'm5',
        authorName: 'ちゅら旅',
        authorAvatar: MALE_AVATARS[2],
        authorBio: '離島と青い海が大好き！年に3回は沖縄に行きます🌺',
        covers: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        ],
        events: [
          {
            id: generateId(),
            date: today,
            time: '11:00',
            title: '宮古空港でレンタカー出発＆伊良部大橋ドライブ',
            type: 'transport',
            cost: 4500,
            status: 'approved',
            authorId: 'm5',
            location: '伊良部大橋',
          },
          {
            id: generateId(),
            date: today,
            time: '12:30',
            title: '宮古そば＆ソーキそばランチ',
            type: 'meal',
            cost: 1100,
            status: 'approved',
            authorId: 'm5',
            location: '古謝そば屋',
          },
          {
            id: generateId(),
            date: today,
            time: '14:30',
            title: '与那覇前浜ビーチ＆ウミガメシュノーケル体験',
            type: 'active',
            cost: 6500,
            status: 'approved',
            authorId: 'm5',
            location: '与那覇前浜ビーチ',
          },
          {
            id: generateId(),
            date: today,
            time: '18:00',
            title: 'オーシャンビューリゾートホテル宿泊',
            type: 'hotel',
            cost: 18000,
            status: 'approved',
            authorId: 'm5',
            location: '宮古島',
          },
          {
            id: generateId(),
            date: tomorrow,
            time: '13:00',
            title: '完熟マンゴーパフェ＆南国カフェ',
            type: 'meal',
            cost: 1800,
            status: 'approved',
            authorId: 'm5',
            location: 'ユートピアファーム宮古島',
          },
        ],
      },
      {
        title: '広島・尾道レトロ坂道＆しまなみ海道サイクリング',
        description:
          '瀬戸内海の島々を自転車で駆け抜ける爽快旅！尾道ラーメンも堪能しました。',
        destination: '広島県',
        region: '中国・四国',
        authorId: 'm6',
        authorName: 'せとうちライダー',
        authorAvatar: MALE_AVATARS[3],
        authorBio: '自転車と一緒に全国の海沿いを走っています🚲',
        covers: [
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        ],
        events: [
          {
            id: generateId(),
            date: today,
            time: '10:00',
            title: '尾道駅前でレンタサイクル貸出',
            type: 'active',
            cost: 3000,
            status: 'approved',
            authorId: 'm6',
            location: '尾道駅',
          },
          {
            id: generateId(),
            date: today,
            time: '12:00',
            title: '本場の尾道ラーメンランチ',
            type: 'meal',
            cost: 950,
            status: 'approved',
            authorId: 'm6',
            location: '尾道商店街',
          },
          {
            id: generateId(),
            date: today,
            time: '14:00',
            title: '千光寺山ロープウェイ＆猫の細道散策',
            type: 'sightseeing',
            cost: 700,
            status: 'approved',
            authorId: 'm6',
            location: '千光寺',
          },
          {
            id: generateId(),
            date: today,
            time: '17:30',
            title: '瀬戸内海ビューのサイクリスト向けホテル宿泊',
            type: 'hotel',
            cost: 12000,
            status: 'approved',
            authorId: 'm6',
            location: 'ONOMICHI U2',
          },
        ],
      },
      {
        title: '軽井沢・森のカフェとアウトレット週末旅',
        description:
          '東京から新幹線で1時間！緑に囲まれたテラス席でモーニングを楽しむ大人の休日。',
        destination: '長野県',
        region: '中部',
        authorId: 'm7',
        authorName: '高原カフェ部',
        authorAvatar: FEMALE_AVATARS[4],
        authorBio: '信州のカフェとパン屋さん巡りが趣味です🥐',
        covers: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
        ],
        events: [
          {
            id: generateId(),
            date: today,
            time: '09:30',
            title: 'ベーカリー＆レストラン沢村で高原モーニング',
            type: 'meal',
            cost: 2200,
            status: 'approved',
            authorId: 'm7',
            location: 'ベーカリー＆レストラン沢村 旧軽井沢',
          },
          {
            id: generateId(),
            date: today,
            time: '11:30',
            title: '白糸の滝＆旧軽井沢銀座通り食べ歩き',
            type: 'sightseeing',
            cost: 1500,
            status: 'approved',
            authorId: 'm7',
            location: '旧軽井沢銀座通り',
          },
          {
            id: generateId(),
            date: today,
            time: '14:30',
            title: 'ハルニレテラスで丸山珈琲＆川辺散策',
            type: 'meal',
            cost: 1400,
            status: 'approved',
            authorId: 'm7',
            location: 'ハルニレテラス',
          },
          {
            id: generateId(),
            date: today,
            time: '17:00',
            title: '軽井沢の森リゾートホテル宿泊',
            type: 'hotel',
            cost: 16500,
            status: 'approved',
            authorId: 'm7',
            location: '軽井沢',
          },
        ],
      },
    ];

    const template = EXTRA_FEED_POOL[refreshCount % EXTRA_FEED_POOL.length];
    const totalEventCost = template.events.reduce(
      (sum, ev) => sum + (Number(ev.cost) || 0),
      0
    );
    const newPost = {
      id: 'PUB-' + generateId(),
      title: template.title,
      description: template.description,
      destination: template.destination,
      region: template.region,
      authorId: template.authorId,
      authorName: template.authorName,
      authorAvatar: template.authorAvatar,
      authorBio: template.authorBio,
      likes: Math.floor(Math.random() * 180) + 25,
      views: Math.floor(Math.random() * 900) + 200,
      likedBy: [],
      covers: template.covers,
      startDate: today,
      endDate: tomorrow,
      budget: totalEventCost,
      publishedAt: Date.now(),
      members: [
        { id: template.authorId, name: template.authorName, color: '#7A9D8C' },
      ],
      comments: [],
      events: template.events,
    };

    const shuffledExisting = [...publicTrips].sort(() => Math.random() - 0.5);
    setPublicTrips([newPost, ...shuffledExisting]);
    setRefreshCount((prev) => prev + 1);
    customAlert('最新の投稿に更新しました！');
  };

  return (
    <div className="h-[100dvh] w-full font-sans flex justify-center bg-stone-300 text-stone-800 antialiased selection:bg-[#7A9D8C]/20 overflow-hidden">
      <div className="w-full max-w-md h-[100dvh] relative shadow-2xl flex flex-col overflow-hidden bg-[#F4F7F5]">
        {toastMsg && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 w-11/12 max-w-[350px] bg-stone-800/95 text-white px-5 py-3 rounded-2xl shadow-xl z-[9999] text-xs font-bold animate-in slide-in-from-top-4 fade-in duration-300 whitespace-pre-wrap text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-[#7A9D8C]" />
            {toastMsg}
          </div>
        )}
        <div
          className={
            activeTripId
              ? 'hidden'
              : 'flex-1 flex flex-col h-full overflow-hidden'
          }
        >
          <Dashboard
            currentUser={currentUser}
            onUpgradeUser={upgradeGuestUser}
            onLogout={() => setCurrentUser(null)}
            trips={trips}
            publicTrips={publicTrips}
            setTrips={setTrips}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
            onOpenTrip={(id, readOnly = false) => {
              setIsReadOnlyMode(readOnly);
              setActiveTripId(id);
            }}
            onToggleLike={toggleLike}
            onToggleFollow={handleToggleFollow}
            onEnlargeImage={setEnlargedImageUrl}
            onRefreshPublicTrips={handleRefreshPublicTrips}
            notifications={notifications}
            setNotifications={setNotifications}
            onAddComment={handleAddComment}
            onCopySave={(newTrip, updatedTrip) => {
              if (newTrip) {
                setTrips([newTrip, ...trips]);
                setDashboardState((prev) => ({ ...prev, activeTab: 'my' }));
                setIsReadOnlyMode(false);
                setActiveTripId(newTrip.id);
                customAlert(
                  newTrip.isSoloTrip
                    ? '👤 1人旅のしおりとしてコピーしました！'
                    : '👥 みんなの旅のしおりとしてコピーしました！'
                );
              } else if (updatedTrip) {
                setTrips(
                  trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
                );
                setDashboardState((prev) => ({ ...prev, activeTab: 'my' }));
                setIsReadOnlyMode(false);
                setActiveTripId(updatedTrip.id);
                customAlert('選択したしおりに予定をコピーしました！');
              }
            }}
            isHidden={Boolean(activeTripId)}
          />
        </div>
        {activeTripId && (
          <TripDetail
            currentUser={currentUser}
            trip={activeTrip}
            isReadOnly={isReadOnlyMode}
            myTrips={trips}
            updateTrip={(updatedTrip) => {
              if (!isReadOnlyMode)
                setTrips(
                  trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
                );
            }}
            onDeleteTrip={(tripIdToDelete) => {
              setTrips(trips.filter((t) => t.id !== tripIdToDelete));
              if (minimizedTripId === tripIdToDelete) setMinimizedTripId(null);
              setActiveTripId(null);
              customAlert('しおりを削除しました');
            }}
            onToggleAutoMinimize={handleToggleAutoMinimize}
            onPublish={handlePublishTrip}
            onBack={handleBackFromTrip}
            onEnlargeImage={setEnlargedImageUrl}
            onCopySave={(newTrip, updatedTrip) => {
              if (newTrip) {
                setTrips([newTrip, ...trips]);
                setDashboardState((prev) => ({ ...prev, activeTab: 'my' }));
                setIsReadOnlyMode(false);
                setActiveTripId(newTrip.id);
                customAlert(
                  newTrip.isSoloTrip
                    ? '👤 1人旅のしおりとしてコピーしました！'
                    : '👥 みんなの旅のしおりとしてコピーしました！'
                );
              } else if (updatedTrip) {
                setTrips(
                  trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
                );
                setDashboardState((prev) => ({ ...prev, activeTab: 'my' }));
                setIsReadOnlyMode(false);
                setActiveTripId(updatedTrip.id);
                customAlert('予定を自分のしおりにコピーしました！');
              }
            }}
            onOpenAuthUpgrade={() => {
              setActiveTripId(null);
              customAlert(
                '右上のプロフィールアイコンから無料アカウント登録ができます！'
              );
            }}
            onAddComment={handleAddComment}
          />
        )}

        {/* LINEのマルチタスクアイコンのように画面のどこにでもドラッグ配置できるミニしおりアイコン */}
        {minimizedTrip &&
          (activeTripId !== minimizedTrip.id || isReadOnlyMode) && (
            <FloatingTripBubble
              trip={minimizedTrip}
              isViewingOtherTrip={Boolean(activeTripId && isReadOnlyMode)}
              onRestore={() => {
                setIsReadOnlyMode(false);
                setActiveTripId(minimizedTrip.id);
              }}
              onClose={() => setMinimizedTripId(null)}
            />
          )}

        {enlargedImageUrl && (
          <div
            className="fixed inset-0 bg-black/85 z-[300] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setEnlargedImageUrl(null)}
          >
            <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors">
              <X size={22} />
            </button>
            <div
              className="max-w-md w-full max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={enlargedImageUrl}
                alt="Enlarged view"
                className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl animate-in zoom-in-95"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// 画面のどこにでも配置できるフローティング・ミニしおりアイコン (LINE風)
// ------------------------------------------
function FloatingTripBubble({ trip, isViewingOtherTrip, onRestore, onClose }) {
  const [pos, setPos] = useState({ x: 280, y: 420 });
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef(null);
  const dragInfoRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 280,
    originY: 420,
    moved: false,
  });

  useEffect(() => {
    const parent = bubbleRef.current?.parentElement;
    if (parent) {
      const initX = Math.max(12, parent.clientWidth - 88);
      const initY = Math.max(
        90,
        Math.min(
          parent.clientHeight - 170,
          Math.round(parent.clientHeight * 0.62)
        )
      );
      setPos({ x: initX, y: initY });
    }
  }, []);

  const startDrag = (clientX, clientY) => {
    dragInfoRef.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragInfoRef.current.active) return;
    const dx = clientX - dragInfoRef.current.startX;
    const dy = clientY - dragInfoRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragInfoRef.current.moved = true;
    }
    const parent = bubbleRef.current?.parentElement;
    const maxW = parent ? parent.clientWidth - 76 : 340;
    const maxH = parent ? parent.clientHeight - 92 : 700;
    const nextX = Math.max(8, Math.min(maxW, dragInfoRef.current.originX + dx));
    const nextY = Math.max(
      56,
      Math.min(maxH, dragInfoRef.current.originY + dy)
    );
    setPos({ x: nextX, y: nextY });
  };

  const endDrag = () => {
    if (!dragInfoRef.current.active) return;
    dragInfoRef.current.active = false;
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleWinMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const handleWinMouseUp = () => endDrag();
    window.addEventListener('mousemove', handleWinMouseMove);
    window.addEventListener('mouseup', handleWinMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWinMouseMove);
      window.removeEventListener('mouseup', handleWinMouseUp);
    };
  }, [isDragging, pos]);

  const handleTouchStart = (e) => {
    if (e.target.closest('[data-close-bubble]')) return;
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!dragInfoRef.current.active) return;
    const touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    endDrag();
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('[data-close-bubble]')) return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const handleClickMain = () => {
    if (dragInfoRef.current.moved) {
      dragInfoRef.current.moved = false;
      return;
    }
    onRestore();
  };

  return (
    <div
      ref={bubbleRef}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className={`absolute z-[180] select-none ${
        isDragging
          ? 'scale-105 cursor-grabbing'
          : 'cursor-grab transition-transform duration-150 hover:scale-105'
      }`}
    >
      <div className="relative group">
        {/* 右上の閉じる（ミニ化解除）ボタン */}
        <button
          type="button"
          data-close-bubble="true"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-stone-800/90 text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-red-500 transition-colors z-10"
          title="ミニアイコンを閉じる"
        >
          <X size={12} strokeWidth={3} />
        </button>

        {/* 丸型フローティングアイコン本体 */}
        <button
          type="button"
          onClick={handleClickMain}
          className="w-[68px] h-[68px] rounded-[24px] bg-gradient-to-br from-[#7A9D8C] to-[#557465] text-white shadow-xl border-[3px] border-white flex flex-col items-center justify-center p-1.5 relative overflow-hidden active:scale-95"
          title="タップして自分のしおりを開く（ドラッグで移動）"
        >
          <span className="text-[8px] font-extrabold bg-white/20 px-1.5 py-0.2 rounded-full mb-0.5 tracking-tight">
            {isViewingOtherTrip ? '自分の旅へ' : 'しおりを開く'}
          </span>
          <MapIcon size={18} className="mb-0.5 shrink-0 drop-shadow-2xs" />
          <span className="text-[9px] font-extrabold leading-tight w-full truncate text-center px-0.5">
            {trip.title}
          </span>
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------
// AuthScreen
// ------------------------------------------
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState(1); // 1: メール/PW, 2: プロフィール設定, 'forgot': PW再設定
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [residence, setResidence] = useState('未設定');
  const [city, setCity] = useState('');
  const [station, setStation] = useState('');
  const [avatar, setAvatar] = useState(FEMALE_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [suggestedIds, setSuggestedIds] = useState([]);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const fileInputRef = useRef(null);

  const isIdTaken = ['admin', 'test', 'user'].includes(
    (userId || '').toLowerCase()
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (name || email)
        setSuggestedIds(generateSuggests(name, email.split('@')[0]));
    }, 500);
    return () => clearTimeout(timeout);
  }, [name, email]);

  const handleNext = () => {
    if (!email || !password) {
      customAlert('メールアドレスとパスワードを入力してください');
      return;
    }
    if (isLogin)
      onLogin({
        id: 'user123',
        name: 'テストユーザー',
        email,
        password,
        passkeys: [],
        avatar: FEMALE_AVATARS[0],
        isGuest: false,
        following: ['m1'],
        followers: [],
      });
    else setStep(2);
  };

  const handlePasskeyLogin = () => {
    customAlert('パスキー（生体認証）で認証しました！');
    onLogin({
      id: 'user123',
      name: 'テストユーザー',
      email: email || 'user@example.com',
      password: 'password123',
      passkeys: [
        {
          id: 'pk_default',
          name: 'このデバイスのパスキー',
          createdAt: new Date().toLocaleDateString(),
        },
      ],
      avatar: FEMALE_AVATARS[0],
      isGuest: false,
      following: ['m1'],
      followers: [],
    });
  };

  const handleRegister = () => {
    if (!name || !userId || isIdTaken) {
      customAlert('ニックネームと有効なIDを入力してください');
      return;
    }
    onLogin({
      id: userId,
      name,
      email,
      password,
      passkeys: [],
      residence,
      city,
      station,
      avatar: customAvatar || avatar,
      isGuest: false,
      following: ['m1'],
      followers: [],
    });
  };

  const handleGuest = () => {
    onLogin({
      id: generateId(),
      name: 'ゲストユーザー',
      isGuest: true,
      avatar: FEMALE_AVATARS[0],
      following: [],
      followers: ['m2'],
    });
  };

  return (
    <div className="min-h-screen bg-stone-300 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#7A9D8C] tracking-widest mb-2">
            たびたび
          </h1>
          <p className="text-xs text-stone-500 font-bold">
            みんなの旅行計画アプリ
          </p>
        </div>

        {step === 'forgot' ? (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="font-bold text-stone-800 text-lg mb-2 text-center">
              パスワードの再設定
            </h2>
            {forgotStep === 1 ? (
              <>
                <p className="text-xs text-stone-500 text-center mb-5 leading-relaxed">
                  ご登録のメールアドレスを入力してください。
                  <br />
                  パスワード再設定用の認証コードをお送りします。
                </p>
                <div className="mb-5">
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                    登録メールアドレス
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    placeholder="mail@example.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!resetEmail.trim()) {
                      customAlert('メールアドレスを入力してください');
                      return;
                    }
                    customAlert(
                      `${resetEmail} 宛に認証コード（123456）を送信しました`
                    );
                    setForgotStep(2);
                  }}
                  className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors mb-3"
                >
                  認証コードを送信する
                </button>
              </>
            ) : (
              <>
                <div className="p-3 bg-[#7A9D8C]/10 border border-[#7A9D8C]/20 rounded-2xl text-[11px] font-bold text-[#557465] mb-4 text-center">
                  {resetEmail} に送信された6桁のコードと
                  <br />
                  新しいパスワードを入力してください
                </div>
                <div className="space-y-3.5 mb-5">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                      認証コード（6桁）
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="例: 123456"
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                      新しいパスワード
                    </label>
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="8文字以上の英数字"
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !resetCode.trim() ||
                      resetNewPassword.trim().length < 8
                    ) {
                      customAlert(
                        '認証コードと8文字以上の新しいパスワードを入力してください'
                      );
                      return;
                    }
                    customAlert(
                      'パスワードを再設定しました！新しいパスワードでログインしてください。'
                    );
                    setEmail(resetEmail);
                    setPassword(resetNewPassword);
                    setStep(1);
                    setIsLogin(true);
                    setForgotStep(1);
                  }}
                  className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors mb-3"
                >
                  パスワードを再設定する
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setForgotStep(1);
              }}
              className="w-full py-2.5 text-xs font-bold text-stone-400 hover:text-stone-600"
            >
              ログイン画面に戻る
            </button>
          </div>
        ) : step === 1 ? (
          <div className="animate-in fade-in slide-in-from-left-4">
            <h2 className="font-bold text-stone-800 text-lg mb-4 text-center">
              {isLogin ? 'ログイン' : '新規アカウント作成'}
            </h2>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  placeholder="mail@example.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 px-1">
                  <label className="text-[11px] font-bold text-stone-500">
                    パスワード
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setForgotStep(1);
                        setStep('forgot');
                      }}
                      className="text-[11px] font-bold text-[#7A9D8C] hover:underline"
                    >
                      パスワードを忘れた方
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  placeholder="8文字以上の英数字"
                />
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors mb-3"
            >
              {isLogin ? 'ログインする' : '次へ（プロフィール設定）'}
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={handlePasskeyLogin}
                className="w-full py-3 bg-stone-900 text-white font-bold rounded-2xl shadow-sm text-xs hover:bg-stone-800 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-amber-400" />{' '}
                パスキー（生体認証）でログイン
              </button>
            )}
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-stone-500 font-bold hover:text-[#7A9D8C] underline"
              >
                {isLogin
                  ? 'アカウントをお持ちでない方はこちら'
                  : '既にアカウントをお持ちの方はこちら'}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 max-h-[70vh] overflow-y-auto no-scrollbar pb-2">
            <h2 className="font-bold text-stone-800 text-lg mb-4 text-center">
              プロフィール設定
            </h2>

            <div className="mb-6 flex flex-col items-center">
              <p className="text-[11px] font-bold text-stone-500 mb-3 text-center bg-stone-100 px-3 py-1 rounded-full">
                初期アイコン、または自分の写真から選べます
              </p>
              <div className="relative w-24 h-24 mb-5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner text-stone-400 z-0 hover:bg-stone-100"
                >
                  {customAvatar ? (
                    <img
                      src={customAvatar}
                      className="w-full h-full object-cover"
                      alt="custom"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Camera size={20} className="mb-1" />
                      <span className="text-[9px] font-bold">写真を選ぶ</span>
                    </div>
                  )}
                </button>
                <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full border-[3px] border-white shadow-md bg-stone-100 z-10 overflow-hidden pointer-events-none">
                  <img
                    src={avatar}
                    alt="preset"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      setCustomAvatar(URL.createObjectURL(e.target.files[0]));
                  }}
                  className="hidden"
                />
              </div>
              <div className="w-full space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 mb-1.5 text-center">
                    女性風アイコン
                  </p>
                  <div className="flex justify-center gap-2">
                    {FEMALE_AVATARS.map((url) => (
                      <button
                        key={url}
                        onClick={() => {
                          setAvatar(url);
                          setCustomAvatar(null);
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          avatar === url && !customAvatar
                            ? 'border-[#7A9D8C] scale-110 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt="female"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 mb-1.5 text-center">
                    男性風アイコン
                  </p>
                  <div className="flex justify-center gap-2">
                    {MALE_AVATARS.map((url) => (
                      <button
                        key={url}
                        onClick={() => {
                          setAvatar(url);
                          setCustomAvatar(null);
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          avatar === url && !customAvatar
                            ? 'border-[#7A9D8C] scale-110 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt="male"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                  ニックネーム
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  placeholder="例: たびたろう"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                  ユーザーID (半角英数字)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={`w-full p-3 pr-10 bg-stone-50 border ${
                      userId && isIdTaken
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-stone-200 focus:ring-[#7A9D8C]'
                    } rounded-xl text-sm font-bold focus:outline-none focus:ring-2 font-mono`}
                    placeholder="例: taro_123"
                  />
                  {userId && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isIdTaken ? (
                        <XCircle size={18} className="text-red-500" />
                      ) : (
                        <CheckCircle2 size={18} className="text-[#7A9D8C]" />
                      )}
                    </div>
                  )}
                </div>
                {suggestedIds.length > 0 && !userId && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {suggestedIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => setUserId(id)}
                        className="px-2 py-1 bg-stone-100 text-stone-600 rounded-lg text-[10px] font-mono hover:bg-stone-200 transition-colors"
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                  居住地・最寄り駅
                </label>
                <p className="text-[9px] text-stone-400 mb-2 leading-tight px-1">
                  ※公開されません。登録すると交通手段の検索が便利になります。
                </p>
                <div className="space-y-2">
                  <select
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  >
                    <option value="未設定">都道府県を選択 (未設定)</option>
                    {PREFECTURES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="市区町村 (例: 渋谷区)"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                  <StationSearchInput
                    value={station}
                    onChange={setStation}
                    cityContext={city}
                    prefectureContext={residence}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleRegister}
              className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors mb-3"
            >
              登録して始める
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 text-xs font-bold text-stone-400 hover:text-stone-600"
            >
              戻る
            </button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-stone-100 text-center flex flex-col items-center">
          <button
            onClick={handleGuest}
            className="text-[11px] font-bold text-stone-400 hover:text-stone-600 flex justify-center items-center gap-1 mx-auto mb-2"
          >
            <User size={12} /> アカウントを作らずにゲストとして始める
          </button>
          <p className="text-[9px] text-stone-400 leading-tight">
            ※ゲスト利用は一部機能が制限されます。後から引き継ぎ可能です。
          </p>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// Dashboard
// ------------------------------------------
function Dashboard({
  currentUser,
  onUpgradeUser,
  onLogout,
  trips,
  publicTrips,
  setTrips,
  dashboardState,
  setDashboardState,
  onOpenTrip,
  onToggleLike,
  onToggleFollow,
  onEnlargeImage,
  onRefreshPublicTrips,
  notifications,
  setNotifications,
  onAddComment,
  onCopySave,
  isHidden,
}) {
  const activeTab = dashboardState?.activeTab || 'my';
  const setActiveTab = (tab) =>
    setDashboardState((prev) => ({
      ...prev,
      activeTab: tab,
      scrollTop: 0,
      windowScrollY: 0,
    }));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);
  const [dashboardCopyTarget, setDashboardCopyTarget] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!isHidden) {
      if (
        scrollContainerRef.current &&
        dashboardState?.scrollTop !== undefined
      ) {
        scrollContainerRef.current.scrollTop = dashboardState.scrollTop;
      }
      if (
        typeof window !== 'undefined' &&
        dashboardState?.windowScrollY !== undefined
      ) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: dashboardState.windowScrollY,
            behavior: 'instant',
          });
        });
      }
    }
  }, [isHidden]);

  const handleOpenTripWithScroll = (id, readOnly = false) => {
    const currentScroll = scrollContainerRef.current
      ? scrollContainerRef.current.scrollTop
      : 0;
    const currentWinY = typeof window !== 'undefined' ? window.scrollY : 0;
    setDashboardState((prev) => ({
      ...prev,
      scrollTop: currentScroll,
      windowScrollY: currentWinY,
    }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    onOpenTrip(id, readOnly);
  };

  const todayStr = getTodayString();
  const upcomingTrips = useMemo(
    () =>
      (trips || [])
        .filter((t) => (t.endDate || '') >= todayStr)
        .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || '')),
    [trips, todayStr]
  );
  const pastTrips = useMemo(
    () =>
      (trips || [])
        .filter((t) => (t.endDate || '') < todayStr)
        .sort((a, b) => (b.endDate || '').localeCompare(a.endDate || '')),
    [trips, todayStr]
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="bg-white px-6 pt-11 pb-4 shadow-sm z-20 relative shrink-0">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-widest text-2xl text-[#7A9D8C]">
              たびたび
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setNotifications(
                  notifications.map((n) => ({ ...n, read: true }))
                );
              }}
              className="relative p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors mr-1"
            >
              <Bell size={22} />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="relative group transition-transform active:scale-95 outline-none"
            >
              <UserAvatar user={currentUser} size="w-10 h-10" />
              {currentUser.isGuest && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                </span>
              )}
            </button>
          </div>
        </div>

        {showNotifications && (
          <div className="absolute top-16 right-4 w-72 bg-white rounded-2xl shadow-xl border border-stone-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="p-3 border-b border-stone-100 flex justify-between items-center">
              <h4 className="font-bold text-sm text-stone-800">お知らせ</h4>
            </div>
            <div className="max-h-64 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400">
                  通知はありません
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-stone-50 text-xs ${
                      !n.read ? 'bg-stone-50/80' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {n.type === 'like' ? (
                          <Heart size={14} className="text-red-500" />
                        ) : (
                          <MessageSquare size={14} className="text-[#7A9D8C]" />
                        )}
                      </div>
                      <div>
                        <p className="text-stone-700 font-bold mb-0.5 leading-snug">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-stone-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex bg-stone-100 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'my'
                ? 'bg-white shadow-sm text-stone-800'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            自分たちの旅
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-white shadow-sm text-stone-800'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Globe size={15} /> みんなの旅
          </button>
        </div>
      </div>

      {/* コンテンツ領域：「自分たちの旅」はここがスクロール、「みんなの旅」は内部でタブ固定＋投稿のみスクロール */}
      <div
        ref={activeTab === 'my' ? scrollContainerRef : null}
        className={`flex-1 bg-[#F4F7F5] ${
          activeTab === 'my'
            ? 'overflow-y-auto overscroll-y-contain no-scrollbar'
            : 'flex flex-col overflow-hidden'
        }`}
      >
        {activeTab === 'my' ? (
          <div className="px-6 py-6 pb-28 animate-in fade-in duration-300">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm flex justify-center items-center gap-2 hover:bg-[#688a79]"
              >
                <Plus size={18} /> 新しい旅
              </button>
              <button
                onClick={() => {
                  if (currentUser.isGuest) {
                    customAlert('ゲストモードでは、参加できません。');
                    return;
                  }
                  setShowJoinModal(true);
                }}
                className="flex-1 py-3.5 bg-white text-[#7A9D8C] border-2 border-[#7A9D8C] font-bold rounded-2xl shadow-sm text-sm flex justify-center items-center gap-2 hover:bg-stone-50"
              >
                <Check size={18} /> コードで参加
              </button>
            </div>
            {trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 text-[#7A9D8C] rotate-6 border border-stone-100">
                  <Compass size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-stone-800 mb-1">
                  旅行のしおりがありません
                </h3>
                <p className="text-xs text-stone-500">
                  「新しい旅」を作るか、
                  <br />
                  友達の招待コードで参加しましょう。
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {upcomingTrips.length > 0 && (
                  <div className="flex flex-col gap-3.5">
                    <h2 className="text-xs font-bold text-stone-400 mb-0.5 flex items-center gap-1.5">
                      <Calendar size={14} /> これからの旅 (
                      {upcomingTrips.length})
                    </h2>
                    {upcomingTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onOpenTrip={handleOpenTripWithScroll}
                      />
                    ))}
                  </div>
                )}
                {pastTrips.length > 0 && (
                  <div className="flex flex-col gap-3.5">
                    <h2 className="text-xs font-bold text-stone-400 mb-0.5 flex items-center gap-1.5">
                      <Camera size={14} /> 過去の旅・思い出 ({pastTrips.length})
                    </h2>
                    {pastTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onOpenTrip={handleOpenTripWithScroll}
                        isPast
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <DiscoverTab
            publicTrips={publicTrips}
            currentUser={currentUser}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
            onOpenTrip={handleOpenTripWithScroll}
            onCopyTrip={(tripToCopy) =>
              setDashboardCopyTarget({ type: 'trip', data: tripToCopy })
            }
            onToggleLike={onToggleLike}
            onToggleFollow={onToggleFollow}
            onOpenUserProfile={setViewingUserProfile}
            onEnlargeImage={onEnlargeImage}
            onRefreshPublicTrips={onRefreshPublicTrips}
            onAddComment={onAddComment}
            scrollContainerRef={scrollContainerRef}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateTripWizard
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onComplete={(newTrip) => {
            setShowCreateModal(false);
            setTrips([newTrip, ...trips]);
            handleOpenTripWithScroll(newTrip.id, false);
          }}
        />
      )}
      {showJoinModal && (
        <JoinTripWizard
          currentUser={currentUser}
          trips={trips}
          setTrips={setTrips}
          onClose={() => setShowJoinModal(false)}
          onOpenTrip={handleOpenTripWithScroll}
        />
      )}
      {showProfileModal && (
        <UserSettingsModal
          currentUser={currentUser}
          publicTrips={publicTrips}
          onToggleFollow={onToggleFollow}
          onOpenUserProfile={(profile) => {
            setShowProfileModal(false);
            setViewingUserProfile(profile);
          }}
          onUpgradeUser={onUpgradeUser}
          onClose={() => setShowProfileModal(false)}
          onLogout={onLogout}
        />
      )}
      {viewingUserProfile && (
        <PublicUserProfileModal
          userProfile={viewingUserProfile}
          publicTrips={publicTrips}
          currentUser={currentUser}
          onToggleFollow={onToggleFollow}
          onOpenTrip={(tripId) => {
            setViewingUserProfile(null);
            handleOpenTripWithScroll(tripId, true);
          }}
          onClose={() => setViewingUserProfile(null)}
        />
      )}
      {dashboardCopyTarget && (
        <CopyModal
          type={dashboardCopyTarget.type}
          sourceData={dashboardCopyTarget.data}
          currentUser={currentUser}
          myTrips={trips}
          onClose={() => setDashboardCopyTarget(null)}
          onOpenRegister={() => {
            setDashboardCopyTarget(null);
            setShowProfileModal(true);
          }}
          onComplete={(newTrip, updatedTrip) => {
            if (onCopySave) onCopySave(newTrip, updatedTrip);
            setDashboardCopyTarget(null);
          }}
        />
      )}
    </div>
  );
}

function TripCard({ trip, onOpenTrip, isPast = false }) {
  return (
    <div
      onClick={() => onOpenTrip(trip.id, false)}
      className={`bg-white p-5 rounded-3xl shadow-sm cursor-pointer border border-stone-100 hover:shadow-md transition-all active:scale-[0.99] ${
        isPast ? 'opacity-85 grayscale-[15%]' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-base text-stone-800 pr-2 leading-snug">
          {trip.title}
        </h3>
        {trip.isSoloTrip && (
          <span className="text-[10px] bg-stone-100 text-stone-500 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">
            👤 ひとり旅
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs font-medium text-stone-500 mb-3.5">
        <span className="flex items-center gap-1">
          <MapPin size={12} className="text-[#7A9D8C]" />{' '}
          {trip.destination || '未設定'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> {trip.startDate.replace(/-/g, '/')}
        </span>
      </div>
      <div className="flex -space-x-2 pt-1 border-t border-stone-50 items-center justify-between">
        <div className="flex -space-x-2">
          {(trip.members || []).map((m, i) => (
            <div
              key={m.id || i}
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden"
              style={{ backgroundColor: m.color, zIndex: 10 - i }}
              title={m.name}
            >
              {m.avatar ? (
                <img
                  src={m.avatar}
                  alt="member"
                  className="w-full h-full object-cover"
                />
              ) : (
                m.name.charAt(0)
              )}
            </div>
          ))}
        </div>
        <span className="text-[11px] font-bold text-stone-400 flex items-center gap-0.5">
          開く <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

function CreateTripWizard({ currentUser, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAiEvents, setSelectedAiEvents] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInviteMsg, setCopiedInviteMsg] = useState(false);
  const tripCodeRef = useRef(generateTripCode());
  const myColor = PRESET_COLORS[0];

  const [tripData, setTripData] = useState({
    title: '',
    destination: '',
    startDate: getTodayString(),
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    budget: 50000,
  });

  const handleCreate = (isSolo = false) => {
    const initialEvents = (selectedAiEvents || []).map((ev) => ({
      ...ev,
      id: generateId(),
      status: isSolo ? 'approved' : 'proposed',
      authorId: currentUser.id,
      photos: [],
    }));
    onComplete({
      id: tripCodeRef.current,
      title: tripData.title || '新しい旅行',
      destination: tripData.destination || '行き先未定',
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: Number(tripData.budget) || 50000,
      members: [{ ...currentUser, color: myColor }],
      isSoloTrip: isSolo,
      events: initialEvents,
      photos: [],
    });
  };

  const handleCopyInviteCode = (e) => {
    if (e) e.stopPropagation();
    copyToClipboard(
      tripCodeRef.current,
      `招待コード「${tripCodeRef.current}」をコピーしました！`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyInviteWithAppUrl = (e) => {
    if (e) e.stopPropagation();
    const tripTitle = tripData.title || '新しい旅行';
    const inviteText = `「${tripTitle}」の旅行計画を一緒に作ろう！✈️\n\n▼ 招待コード\n${tripCodeRef.current}\n\n▼ アプリをまだ持っていない方はこちら（インストールURL）\nhttps://tabitabi.app/dl`;
    copyToClipboard(inviteText, 'アプリ紹介URL付きの招待文をコピーしました！');
    setCopiedInviteMsg(true);
    setTimeout(() => setCopiedInviteMsg(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg text-stone-800">
            {step === 1 ? '新しい旅の基本情報' : 'メンバーの招待・共有コード'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold rounded-2xl shadow-sm text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <Sparkles size={16} /> AIにおまかせでプランを提案してもらう
            </button>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                旅のタイトル
              </label>
              <input
                type="text"
                value={tripData.title}
                onChange={(e) =>
                  setTripData({ ...tripData, title: e.target.value })
                }
                placeholder="例: 秋の京都・グルメ旅"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                行き先（都道府県・エリア）
              </label>
              <input
                type="text"
                value={tripData.destination}
                onChange={(e) =>
                  setTripData({ ...tripData, destination: e.target.value })
                }
                placeholder="例: 京都府"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                  出発日
                </label>
                <input
                  type="date"
                  value={tripData.startDate}
                  onChange={(e) =>
                    setTripData({ ...tripData, startDate: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                  最終日
                </label>
                <input
                  type="date"
                  value={tripData.endDate}
                  onChange={(e) =>
                    setTripData({ ...tripData, endDate: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                1人あたりの予算目安（円）
              </label>
              <input
                type="number"
                value={tripData.budget}
                onChange={(e) =>
                  setTripData({ ...tripData, budget: e.target.value })
                }
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
            </div>

            {selectedAiEvents.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2">
                <Sparkles size={15} className="text-amber-500 shrink-0" />
                <span>
                  AI提案の予定（{selectedAiEvents.length}
                  件）が自動で追加されます！
                </span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              {currentUser.isGuest ? (
                <button
                  type="button"
                  onClick={() => handleCreate(true)}
                  className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors"
                >
                  ひとり旅を作成する
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>次へ（メンバー招待設定）</span>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreate(true)}
                    className="w-full py-3 bg-stone-100 text-stone-700 border border-stone-200/80 font-bold rounded-2xl text-xs hover:bg-stone-200/70 transition-colors flex items-center justify-center gap-1.5 active:scale-[0.99]"
                  >
                    <User size={14} className="text-[#7A9D8C]" />
                    <span>ひとりで使う（招待せずしおりを作成）</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-center animate-in slide-in-from-right-4">
            <div className="bg-[#7A9D8C]/10 p-5 rounded-3xl border border-[#7A9D8C]/20">
              <p className="text-xs font-bold text-[#7A9D8C] mb-2">
                しおりの共有・招待コード
              </p>
              <div className="flex items-center justify-between gap-2 bg-white py-2.5 px-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <span className="text-lg sm:text-xl font-mono font-extrabold tracking-widest text-stone-800 select-all flex-1 text-center pl-2">
                  {tripCodeRef.current}
                </span>
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors active:scale-95 ${
                    copiedCode
                      ? 'bg-[#7A9D8C] text-white'
                      : 'bg-[#7A9D8C]/15 hover:bg-[#7A9D8C]/25 text-[#557465]'
                  }`}
                  title="招待コードをコピー"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? 'コピー済' : 'コピー'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopyInviteWithAppUrl}
                className={`w-full mt-3 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                  copiedInviteMsg
                    ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                    : 'bg-white hover:bg-stone-50 text-[#557465] border-[#7A9D8C]/30 shadow-2xs'
                }`}
              >
                {copiedInviteMsg ? <Check size={14} /> : <Share2 size={14} />}
                <span>
                  {copiedInviteMsg
                    ? '招待文をコピーしました！'
                    : 'アプリ紹介リンク付きで招待文をコピー'}
                </span>
              </button>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              友達やパートナーにこのコードを共有すると、
              <br />
              一緒にしおりの予定を編集できるようになります。
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleCreate(false)}
                className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 hover:bg-[#688a79] transition-colors"
              >
                しおりを開く <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleCreate(true)}
                className="w-full py-3 bg-stone-100 text-stone-600 font-bold rounded-2xl text-xs hover:bg-stone-200 transition-colors"
              >
                👤 招待せず「ひとり旅行」としてしおりを開く
              </button>
            </div>
          </div>
        )}

        {showAiModal && (
          <AiPlanSuggestModal
            currentUser={currentUser}
            onClose={() => setShowAiModal(false)}
            onSelectPlan={(plan) => {
              const planEvents = (plan.events || []).map((ev) => ({
                ...ev,
                id: generateId(),
                status: currentUser.isGuest ? 'approved' : 'proposed',
                authorId: currentUser.id,
                photos: [],
              }));
              setTripData({
                title: plan.title,
                destination: plan.destination,
                startDate: plan.startDate,
                endDate: plan.endDate,
                budget: plan.budget,
              });
              setSelectedAiEvents(plan.events || []);
              setShowAiModal(false);

              if (currentUser.isGuest || plan.isSoloPlan) {
                onComplete({
                  id: tripCodeRef.current,
                  title: plan.title || '新しい旅行',
                  destination: plan.destination || '行き先未定',
                  startDate: plan.startDate,
                  endDate: plan.endDate,
                  budget: Number(plan.budget) || 50000,
                  members: [{ ...currentUser, color: myColor }],
                  isSoloTrip: true,
                  events: planEvents,
                  photos: [],
                });
              } else {
                setStep(2);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

// 旅全体のAIおまかせ提案モーダル
function AiPlanSuggestModal({ currentUser, onClose, onSelectPlan }) {
  const [step, setStep] = useState(1);
  const [where, setWhere] = useState('京都府');
  const [theme, setTheme] = useState('グルメ・食べ歩き');
  const [companion, setCompanion] = useState('カップル・夫婦');
  const [headcount, setHeadcount] = useState(2);
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [budgetLimit, setBudgetLimit] = useState('50000');
  const [suggestions, setSuggestions] = useState([]);
  const [expandedPlanIdx, setExpandedPlanIdx] = useState(null);

  const THEMES = [
    'グルメ・食べ歩き',
    '温泉・リラックス',
    '絶景・自然満喫',
    '歴史・寺社巡り',
    'カフェ・街歩き',
  ];
  const COMPANIONS = [
    { id: 'ひとり旅', label: '👤 ひとり旅', defaultCount: 1 },
    { id: 'カップル・夫婦', label: '💑 カップル・夫婦', defaultCount: 2 },
    { id: '友達・グループ', label: '👯 友達・グループ', defaultCount: 3 },
    { id: '家族（子連れ）', label: '👨‍👩‍👧‍👦 家族（子連れ）', defaultCount: 4 },
    { id: '親孝行・三世代', label: '🍵 親孝行・大人旅', defaultCount: 3 },
  ];

  // 出発日から季節を判定するヘルパー
  const seasonInfo = useMemo(() => {
    const month = new Date(startDate || getTodayString()).getMonth() + 1;
    if (month >= 3 && month <= 5) {
      return {
        name: '春',
        badge: '🌸 春（桜・新緑シーズン）',
        tagPrefix: '春爛漫・桜と新緑',
        tip: '春の陽気で散策に最適な季節！人気店は花見客で混み合うため早めの時間帯がおすすめです。',
        spotBonus: {
          京都: {
            title: '哲学の道・蹴上インクライン（桜並木散策）',
            location: '蹴上インクライン',
            memo: '【🌸春限定おすすめ】線路跡の両脇にソメイヨシノが咲き誇る京都屈指の春絶景スポット。',
          },
          箱根: {
            title: '箱根強羅公園（春の山野草＆ローズガーデン）',
            location: '箱根強羅公園',
            memo: '【🌸春限定おすすめ】春の花々が咲き誇るフランス式整型庭園。吹きガラス体験や園内カフェも人気。',
          },
          北海道: {
            title: '円山公園・北海道神宮（遅咲きの桜と梅）',
            location: '円山公園',
            memo: '【🌸春限定おすすめ】本州より少し遅れて訪れる北海道の春。桜と梅が同時に咲く華やかな景色を楽しめます。',
          },
          default: {
            title: '桜名所・春のフラワーパーク散策',
            location: '公園 桜',
            memo: '【🌸春限定おすすめ】春ならではの花景色と爽やかな風を感じながらお散歩できる季節スポット。',
          },
        },
      };
    }
    if (month >= 6 && month <= 8) {
      return {
        name: '夏',
        badge: '🌻 夏（避暑・納涼シーズン）',
        tagPrefix: '夏休み・涼を感じる',
        tip: '日差しが強い季節なので、午前中の散策＋午後は涼しいカフェや水辺・高原スポットを組み合わせています。',
        spotBonus: {
          京都: {
            title: '貴船の川床・宇治抹茶かき氷で納涼体験',
            location: '貴船神社',
            memo: '【🌻夏限定おすすめ】市街地より気温が約5℃低い避暑地・貴船エリアや、濃厚な宇治抹茶かき氷で涼む夏定番コース。',
          },
          箱根: {
            title: '芦ノ湖畔の涼風クルーズ＆冷やし甘酒',
            location: '芦ノ湖',
            memo: '【🌻夏限定おすすめ】標高が高く夏でも爽やかな箱根。湖上の風を感じながら避暑リゾートを満喫できます。',
          },
          北海道: {
            title: '富良野・美瑛のラベンダー畑＆絶品ソフトクリーム',
            location: 'ファーム富田',
            memo: '【🌻夏限定おすすめ】湿度が低くカラッと爽やかな夏の北海道！一面の花畑と濃厚ミルクソフトは格別です。',
          },
          default: {
            title: '渓谷・高原の避暑スポット＆ご当地ひんやりスイーツ',
            location: '渓谷 展望',
            memo: '【🌻夏限定おすすめ】涼やかな水辺や緑の木陰で暑さを忘れてリフレッシュできる夏にぴったりの立ち寄り先。',
          },
        },
      };
    }
    if (month >= 9 && month <= 11) {
      return {
        name: '秋',
        badge: '🍁 秋（紅葉・味覚狩りシーズン）',
        tagPrefix: '紅葉絶景・秋の味覚',
        tip: '紅葉と秋グルメが最高のシーズン！夕暮れ時は冷え込むため羽織るものがあると安心です。',
        spotBonus: {
          京都: {
            title: '永観堂・南禅寺の紅葉絶景＆秋限定栗スイーツ',
            location: '永観堂 禅林寺',
            memo: '【🍁秋限定おすすめ】「もみじの永観堂」と称される圧倒的な紅葉名所。夜間拝観ライトアップも必見です。',
          },
          箱根: {
            title: '仙石原すすき草原（黄金色の秋絶景）',
            location: '仙石原すすき草原',
            memo: '【🍁秋限定おすすめ】秋風に揺れる黄金色のすすきが一面に広がる箱根の秋の風物詩。夕暮れ時が特に幻想的です。',
          },
          北海道: {
            title: '北海道大学 イチョウ並木＆秋鮭・新じゃがグルメ',
            location: '北海道大学 イチョウ並木',
            memo: '【🍁秋限定おすすめ】約380m続く黄金色のイチョウ並木と、旬を迎えた秋鮭・いくら・新じゃが料理を堪能！',
          },
          default: {
            title: '紅葉の名所・秋の絶景ビュースポット散策',
            location: '紅葉 名所',
            memo: '【🍁秋限定おすすめ】赤や黄色に色づく木々と旬の秋スイーツが楽しめる、この季節ならではのベストスポット。',
          },
        },
      };
    }
    return {
      name: '冬',
      badge: '❄️ 冬（雪景色・温泉・イルミシーズン）',
      tagPrefix: '冬の贅沢・温もり',
      tip: '空気が澄んで夜景や雪景色が美しい季節！温かい郷土料理や温泉・イルミネーションを盛り込んでいます。',
      spotBonus: {
        京都: {
          title: '嵐山花灯路・湯豆腐＆京のおばんざい温活',
          location: '嵐山',
          memo: '【❄️冬限定おすすめ】澄んだ冬の空気の中で味わう熱々の京ゆどうふと、風情ある冬の古都散策。',
        },
        箱根: {
          title: '箱根湯本・強羅の雪見露天風呂＆温泉まんじゅう',
          location: '強羅温泉',
          memo: '【❄️冬限定おすすめ】寒い冬こそ最高な箱根の天然温泉！湯気立つ蒸したての温泉まんじゅう食べ歩きも格別です。',
        },
        北海道: {
          title: '大通公園イルミネーション＆熱々味噌ラーメン・スープカレー',
          location: '大通公園',
          memo: '【❄️冬限定おすすめ】白銀の雪景色と幻想的なイルミネーション！体の芯まで温まる北海道グルメを満喫。',
        },
        default: {
          title: '冬のイルミネーション＆ご当地の温かい名物鍋・温泉',
          location: 'イルミネーション',
          memo: '【❄️冬限定おすすめ】冬の澄んだ夜空に輝くイルミネーションと、寒い日に嬉しい温かいご当地グルメを堪能。',
        },
      },
    };
  }, [startDate]);

  const handleSelectCompanion = (comp) => {
    setCompanion(comp.id);
    if (comp.id === 'ひとり旅') {
      setHeadcount(1);
    } else if (headcount === 1) {
      setHeadcount(comp.defaultCount);
    }
  };

  const handleGenerate = () => {
    setStep(2);
    setExpandedPlanIdx(null);
    setTimeout(() => {
      const budgetNum = Number(budgetLimit) || 50000;
      const d1 = startDate;
      const d2 = endDate >= startDate ? endDate : startDate;

      // 同行者・人数に応じたアドバイス文
      const companionNote =
        companion === 'ひとり旅'
          ? '【👤ひとり旅向け】カウンター席もあり1人でも入りやすい名店・自分のペースで巡れるコースです。'
          : companion === 'カップル・夫婦'
          ? `【💑${companion}・${headcount}名向け】雰囲気の良い窓際席や貸切風呂・2人でシェアしやすい食べ歩きを中心に選定しました。`
          : companion === '家族（子連れ）'
          ? `【👨‍👩‍👧‍👦${companion}・${headcount}名向け】座敷・個室があるお店や、お子様も一緒に体験・休憩しやすいゆとりある時間配分です。`
          : `【👯${companion}・${headcount}名向け】${headcount}名でテーブルを囲みやすく、写真撮影やシェアが盛り上がる人気スポットを選定しました。`;

      // エリアごとの高評価・実在スポット＆グルメデータベース（レビュー要約・特徴付き）
      const CURATED_SPOTS = {
        京都: {
          royal: [
            {
              date: d1,
              time: '10:30',
              title: 'JR京都駅 中央口集合・散策スタート',
              type: 'transport',
              location: '京都駅',
              cost: 0,
              memo: '駅構内のコインロッカーに荷物を預けて身軽にスタート。市バス1日券の購入もここで可能。',
            },
            {
              date: d1,
              time: '12:00',
              title: '南禅寺 順正（京ゆどうふ・懐石）',
              type: 'meal',
              location: '南禅寺 順正',
              cost: 3500,
              memo: '【★4.3 / レビュー1,800件超】国の登録有形文化財の美しい日本庭園を眺めながら、名物の京ゆどうふや京懐石を味わえる老舗名店。',
            },
            {
              date: d1,
              time: '14:00',
              title: '清水寺・産寧坂（三年坂）散策',
              type: 'sightseeing',
              location: '清水寺',
              cost: 500,
              memo: '【★4.6 / 京都屈指の絶景】清水の舞台からの京都市街パノラマは圧巻。帰りは産寧坂の京町家や八ッ橋の試食巡りが人気。',
            },
            {
              date: d1,
              time: '15:30',
              title: 'ぎおん徳屋（本わらびもち・抹茶かき氷）',
              type: 'meal',
              location: 'ぎおん徳屋',
              cost: 1600,
              memo: '【★4.4 / 食べログ百名店】注文後に練り上げるプルプル食感の本わらびもちが名物。きな粉と黒蜜の相性が抜群の行列甘味処。',
            },
            {
              date: d1,
              time: '17:30',
              title: '京都嵐山温泉 花伝抄（チェックイン）',
              type: 'hotel',
              location: '京都嵐山温泉 花伝抄',
              cost: Math.round(budgetNum * 0.4),
              memo: '【★4.4 / 5種の無料貸切風呂】阪急嵐山駅前でアクセス抜群。京町家風の館内と種類豊富な貸切温泉・夜鳴きそばサービスが大好評。',
            },
            {
              date: d2,
              time: '10:00',
              title: '嵐山 渡月橋＆竹林の小径',
              type: 'sightseeing',
              location: '嵐山 竹林の小径',
              cost: 0,
              memo: '【★4.5 / 朝の散策がおすすめ】午前10時前なら比較的空いており、数万本の竹が揺れる幻想的な雰囲気をゆっくり撮影できます。',
            },
            {
              date: d2,
              time: '12:00',
              title: '嵐山よしむら（渡月橋を望む手打ち蕎麦）',
              type: 'meal',
              location: '嵐山よしむら',
              cost: 2400,
              memo: '【★4.3 / 絶景ロケーション】渡月橋を一望できる窓際席が大人気。国産蕎麦の実を石臼挽きした香り高い十割蕎麦と天ぷらが絶品。',
            },
          ],
          hidden: [
            {
              date: d1,
              time: '11:00',
              title: '出町柳駅 集合・鴨川デルタ散策',
              type: 'transport',
              location: '出町柳駅',
              cost: 0,
              memo: '鴨川と高野川が合流する開放的な水辺スポット。亀の飛び石を渡ってのんびりスタート。',
            },
            {
              date: d1,
              time: '12:15',
              title: '出町ふたば（名代豆餅）＆周辺の町家ランチ',
              type: 'meal',
              location: '出町ふたば',
              cost: 1800,
              memo: '【★4.5 / 明治32年創業の老舗】赤えんどう豆の塩気と上品なこし餡が絶妙な「名代豆餅」は必食。回転が早く並んでもすぐ買えます。',
            },
            {
              date: d1,
              time: '14:00',
              title: '詩仙堂丈山寺（静寂の庭園鑑賞）',
              type: 'sightseeing',
              location: '詩仙堂',
              cost: 700,
              memo: '【★4.6 / 大人の穴場名刹】一乗寺エリアの静かな山寺。ししおどしの音が響く白砂とサツキの庭園を縁側から眺めて心を整えられます。',
            },
            {
              date: d1,
              time: '15:30',
              title: '一乗寺中谷（絹ごし緑茶てぃらみす）',
              type: 'meal',
              location: '一乗寺中谷',
              cost: 1300,
              memo: '【★4.3 / 和洋折衷カフェ】老舗和菓子店の3代目が作る「絹ごし緑茶てぃらみす」が口コミで大人気。枯山水の坪庭も素敵です。',
            },
            {
              date: d2,
              time: '10:30',
              title: '南禅寺 水路閣＆哲学の道',
              type: 'sightseeing',
              location: '南禅寺 水路閣',
              cost: 0,
              memo: '【★4.5 / レトロな赤レンガアーチ】明治時代に造られたローマ水道橋風のレンガ造り水路閣は写真映え抜群。',
            },
            {
              date: d2,
              time: '12:30',
              title: '山元麺蔵（行列のできる京うどん名店）',
              type: 'meal',
              location: '山元麺蔵',
              cost: 1600,
              memo: '【★4.5 / 全国屈指のうどん名店】コシの強い手打ち麺と「土ゴボウ天うどん」が大評判。電話やネットでの事前予約推奨。',
            },
          ],
          active: [
            {
              date: d1,
              time: '09:30',
              title: 'JR亀岡駅 到着・トロッコ亀岡駅へ移動',
              type: 'transport',
              location: 'トロッコ亀岡駅',
              cost: 1000,
              memo: '保津川下りや嵯峨野トロッコ列車の起点。晴れた日はオープン車両「リッチ号」が開放感抜群！',
            },
            {
              date: d1,
              time: '10:30',
              title: '保津川下り（渓谷スリル舟下り体験）',
              type: 'active',
              location: '保津川下り乗船場',
              cost: 6000,
              memo: '【★4.6 / 約2時間の絶景舟旅】亀岡から嵐山まで約16kmの渓谷を熟練船頭さんの竿さばきで下る迫力満点のアクティビティ。',
            },
            {
              date: d1,
              time: '13:00',
              title: '嵯峨野湯（銭湯リノベーションカフェ）',
              type: 'meal',
              location: '嵯峨野湯',
              cost: 1900,
              memo: '【★4.2 / レトロ建築カフェ】大正時代の銭湯を改装したユニークな店内。タイル壁や鏡を残した空間でふわふわパンケーキやパスタを堪能。',
            },
            {
              date: d1,
              time: '15:00',
              title: 'キモノフォレスト＆嵐電嵐山駅足湯',
              type: 'sightseeing',
              location: '嵐山駅はんなり・ほっこりスクエア',
              cost: 300,
              memo: '【★4.3 / 京友禅ポール600本】駅構内に並ぶ京友禅の光の林を散策した後、駅ホームの天然温泉足湯（タオル付）でリフレッシュ。',
            },
            {
              date: d1,
              time: '17:30',
              title: '先斗町 魯ビン（京町家鴨川納涼・創作和食）',
              type: 'meal',
              location: '先斗町 魯ビン',
              cost: 5500,
              memo: '【★4.3 / 築150年の京町家】風情ある石畳の先斗町にある人気店。京野菜と旬の魚介を使った創作和食とお酒をゆっくり楽しめます。',
            },
          ],
        },
        箱根: {
          royal: [
            {
              date: d1,
              time: '10:30',
              title: '箱根湯本駅 到着・駅前商店街食べ歩き',
              type: 'transport',
              location: '箱根湯本駅',
              cost: 0,
              memo: '【★4.3 / 箱根の玄関口】駅前の「菊川商店」のカステラ焼箱根まんじゅうや「籠清」の揚げかまぼこ食べ歩きが定番。',
            },
            {
              date: d1,
              time: '12:00',
              title: 'はつ花そば 本店（自然薯せいろ蕎麦）',
              type: 'meal',
              location: 'はつ花そば 本店',
              cost: 1800,
              memo: '【★4.2 / 昭和9年創業の老舗】水を使わず自然薯と卵だけで打つ名物「せいろそば」が絶品。早川沿いの風情ある店構えも人気。',
            },
            {
              date: d1,
              time: '14:00',
              title: '彫刻の森美術館（野外アート＆天然温泉足湯）',
              type: 'sightseeing',
              location: '彫刻の森美術館',
              cost: 2000,
              memo: '【★4.4 / レビュー8,000件超】広大な庭園に点在する野外彫刻とステンドグラスの塔「幸せをよぶシンフォニー彫刻」が圧巻。',
            },
            {
              date: d1,
              time: '16:30',
              title: '強羅温泉 季の湯 雪月花（チェックイン）',
              type: 'hotel',
              location: '季の湯 雪月花',
              cost: Math.round(budgetNum * 0.45),
              memo: '【★4.3 / 全室檜の露天風呂付】強羅駅徒歩1分。大浴場・貸切風呂・湯上がり処のアイスや乳酸菌飲料サービスが大人気。',
            },
            {
              date: d2,
              time: '10:30',
              title: '大涌谷（黒たまご＆富士山絶景ロープウェイ）',
              type: 'sightseeing',
              location: '大涌谷',
              cost: 1500,
              memo: '【★4.3 / 迫力の噴煙地】1個食べると7年寿命が延びると言われる名物「黒たまご」と、晴天時の富士山ビューは必見。',
            },
            {
              date: d2,
              time: '12:30',
              title: 'Bakery & Table 箱根（芦ノ湖畔ベーカリーカフェ）',
              type: 'meal',
              location: 'Bakery & Table 箱根',
              cost: 2000,
              memo: '【★4.2 / 芦ノ湖を一望】1階はベーカリー、2階はカフェ、3階はレストラン。湖を眺めながら焼きたて米粉カレードーナツを堪能。',
            },
          ],
          hidden: [
            {
              date: d1,
              time: '11:30',
              title: '宮ノ下エリア 散策開始',
              type: 'transport',
              location: '宮ノ下駅',
              cost: 0,
              memo: 'クラシックホテルやレトロな骨董店が並ぶ落ち着いた温泉街。',
            },
            {
              date: d1,
              time: '12:15',
              title: '渡邊ベーカリー（温泉シチューパン）',
              type: 'meal',
              location: '渡邊ベーカリー',
              cost: 1400,
              memo: '【★4.2 / 明治24年創業】くり抜いたフランスパンの中に熱々のビーフシチューが入った名物「温泉シチューパン」が大評判。',
            },
            {
              date: d1,
              time: '14:00',
              title: 'ポーラ美術館（森の中の現代アート空間）',
              type: 'sightseeing',
              location: 'ポーラ美術館',
              cost: 2200,
              memo: '【★4.5 / 印象派コレクション充実】富士箱根伊豆国立公園の自然の中に溶け込むガラス張りの美術館。遊歩道散策も心地よい穴場。',
            },
            {
              date: d2,
              time: '11:00',
              title: '田むら銀かつ亭 本店（豆腐かつ煮）',
              type: 'meal',
              location: '田むら銀かつ亭 本店',
              cost: 2200,
              memo: '【★4.3 / 強羅名物グルメ】しゃくり豆腐に国産豚ひき肉を挟んで揚げ、土鍋で煮込んだ名物「豆腐かつ煮」は行列必至の美味しさ。',
            },
          ],
          active: [
            {
              date: d1,
              time: '10:00',
              title: '箱根海賊船（桃源台港〜元箱根港クルーズ）',
              type: 'active',
              location: '箱根海賊船 桃源台港',
              cost: 1200,
              memo: '【★4.3 / 芦ノ湖絶景クルーズ】特別船室に乗るとデッキから富士山と箱根神社の平和の鳥居を遮るものなく撮影できます。',
            },
            {
              date: d1,
              time: '11:30',
              title: '箱根神社・九頭龍神社 新宮（水上鳥居参拝）',
              type: 'sightseeing',
              location: '箱根神社',
              cost: 0,
              memo: '【★4.4 / 関東屈指のパワースポット】芦ノ湖に浮かぶ「平和の鳥居」での記念撮影と、龍神水のお清めが定番コース。',
            },
            {
              date: d1,
              time: '13:00',
              title: '甘酒茶屋（江戸時代から続く峠の茶屋）',
              type: 'meal',
              location: '甘酒茶屋',
              cost: 1000,
              memo: '【★4.4 / 創業400年の歴史】砂糖不使用・米麹の自然な甘さの「甘酒」と炭火焼きの「力餅（うぐいす・いそべ）」が絶品。',
            },
          ],
        },
        北海道: {
          royal: [
            {
              date: d1,
              time: '10:30',
              title: 'JR札幌駅 到着・大通公園散策',
              type: 'transport',
              location: '札幌駅',
              cost: 0,
              memo: '札幌のメインストリートを歩きながら時計台やテレビ塔を巡ってスタート。',
            },
            {
              date: d1,
              time: '12:00',
              title: '札幌二条市場 大磯（豪華海鮮丼ランチ）',
              type: 'meal',
              location: '札幌二条市場 大磯',
              cost: 3200,
              memo: '【★4.3 / 新鮮ウニ・イクラ・カニ】市場直送のネタが溢れるほど乗った「大磯丼」が人気。朝〜昼にかけて賑わう札幌グルメの定番。',
            },
            {
              date: d1,
              time: '14:30',
              title: '白い恋人パーク（工場見学＆スイーツ体験）',
              type: 'sightseeing',
              location: '白い恋人パーク',
              cost: 1500,
              memo: '【★4.3 / 英国風の可愛らしい庭園】製造ラインの見学や限定ソフトクリーム、オリジナル缶作りなど大人も楽しめるテーマパーク。',
            },
            {
              date: d1,
              time: '18:30',
              title: 'サッポロビール園 ケッセルホール（生ラムジンギスカン）',
              type: 'meal',
              location: 'サッポロビール園',
              cost: 4800,
              memo: '【★4.4 / 赤レンガの歴史建築】巨大なビールの仕込み釜がある開放的なホールで、工場直送の生ビールと臭みのない生ラム肉を満喫。',
            },
            {
              date: d2,
              time: '11:30',
              title: 'スープカレー GARAKU 札幌本店',
              type: 'meal',
              location: 'スープカレー GARAKU',
              cost: 1800,
              memo: '【★4.4 / 和風ダシ×秘伝スパイス】ホロホロに煮込まれた「やわらかチキンレッグと野菜」が大人気。開店前の整理券取得がおすすめ。',
            },
          ],
          hidden: [
            {
              date: d1,
              time: '12:00',
              title: 'トリトン 円山店（北海道No.1回転寿司）',
              type: 'meal',
              location: '回転寿し トリトン 円山店',
              cost: 2800,
              memo: '【★4.5 / 地元民も通う超人気店】道産ホタテ・活つぶ・炙りえんがわなどネタの大きさと鮮度が別格。円山公園散策とセットがおすすめ。',
            },
            {
              date: d1,
              time: '14:30',
              title: '北海道神宮＆六花亭 神宮茶屋店',
              type: 'sightseeing',
              location: '北海道神宮',
              cost: 500,
              memo: '【★4.5 / 森に囲まれた静かな聖域】参拝後に境内にある「六花亭 神宮茶屋店」で焼き立ての限定菓子「判官さま」を食べるのが通の楽しみ方。',
            },
            {
              date: d1,
              time: '21:00',
              title: 'パフェ、珈琲、酒、佐藤（札幌シメパフェ発祥系）',
              type: 'meal',
              location: 'パフェ、珈琲、酒、佐藤',
              cost: 2200,
              memo: '【★4.4 / 芸術的な夜パフェ専門店】ピスタチオと塩キャラメルのパフェなど、甘さ控えめで洗練された大人のシメパフェ名店。',
            },
          ],
          active: [
            {
              date: d1,
              time: '10:30',
              title: '小樽運河クルーズ＆堺町通り散策',
              type: 'active',
              location: '小樽運河',
              cost: 1800,
              memo: '【★4.4 / レトロな倉庫群を水上から満喫】札幌から快速エアポートで約35分。北一硝子やルタオ本店の食べ歩きも充実。',
            },
            {
              date: d1,
              time: '13:00',
              title: '小樽政寿司 本店（職人握り寿司）',
              type: 'meal',
              location: 'おたる政寿司 本店',
              cost: 4500,
              memo: '【★4.3 / 小樽寿司屋通りの名店】名物の「いかそうめん」や旬の蝦夷バフンウニなど、職人が目の前で握る極上寿司を堪能。',
            },
            {
              date: d1,
              time: '17:30',
              title: '藻岩山ロープウェイ（日本新三大夜景）',
              type: 'sightseeing',
              location: '藻岩山ロープウェイ',
              cost: 2100,
              memo: '【★4.4 / 宝石を散りばめた360度パノラマ】山頂展望台から札幌市街のきらめく大夜景を一望できるロマンチックな絶景スポット。',
            },
          ],
        },
      };

      // 入力された行き先に合うデータベースを検索（該当なければ汎用的な具体店舗名テンプレートを生成）
      const matchedKey = Object.keys(CURATED_SPOTS).find((k) =>
        where.includes(k)
      );
      const cleanArea = where.replace(/[都道府県]$/, '') || '現地';

      const buildFallbackPlans = () => ({
        royal: [
          {
            date: d1,
            time: '10:30',
            title: `${where} 代表駅到着・観光案内所でマップ入手`,
            type: 'transport',
            location: `${cleanArea}駅`,
            cost: 0,
            memo: 'まずは駅構内の観光案内所で最新のグルメマップとバス一日券をチェックして出発！',
          },
          {
            date: d1,
            time: '12:00',
            title: `${cleanArea}の名物料理・老舗郷土レストラン（高評価店）`,
            type: 'meal',
            location: `${cleanArea} 郷土料理 人気店`,
            cost: 2500,
            memo: `【★4.3以上 / 口コミ人気店】${where}に来たら外せない名物ランチを味わえる老舗店。ランチタイムは早めの来店がおすすめ。`,
          },
          {
            date: d1,
            time: '14:00',
            title: `${cleanArea}の象徴・歴史的ランドマーク＆庭園散策`,
            type: 'sightseeing',
            location: `${cleanArea} 観光名所`,
            cost: 1200,
            memo: `【★4.5 / 定番絶景スポット】${where}を代表する歴史建築や絶景展望エリア。写真撮影や周辺の食べ歩きストリートも充実。`,
          },
          {
            date: d1,
            time: '16:30',
            title: `${cleanArea}温泉・露天風呂付き人気宿チェックイン`,
            type: 'hotel',
            location: `${cleanArea} 温泉旅館`,
            cost: Math.round(budgetNum * 0.4),
            memo: `【★4.4 / 夕食評価◎】地元の旬食材を使った会席料理と天然温泉が口コミで高評価の宿。`,
          },
          {
            date: d2,
            time: '10:00',
            title: `${cleanArea}の朝市・お土産セレクトショップ巡り`,
            type: 'sightseeing',
            location: `${cleanArea} 朝市 商店街`,
            cost: 3000,
            memo: `【★4.3 / 食べ歩き＆お土産】地元ならではの限定スイーツや工芸品が揃う人気スポット。`,
          },
          {
            date: d2,
            time: '12:30',
            title: `${cleanArea}の古民家リノベーションカフェ（自家製スイーツ）`,
            type: 'meal',
            location: `${cleanArea} 古民家カフェ`,
            cost: 1800,
            memo: `【★4.4 / 雰囲気抜群】落ち着いた和モダン空間で、地元フルーツや抹茶を使ったパフェ・ランチが楽しめる人気カフェ。`,
          },
        ],
        hidden: [
          {
            date: d1,
            time: '11:00',
            title: `${cleanArea} 郊外の静かな景勝地へドライブ・移動`,
            type: 'transport',
            location: `${cleanArea}`,
            cost: 0,
            memo: '人混みを避けてゆったりスタート。車窓からの風景も楽しめます。',
          },
          {
            date: d1,
            time: '12:30',
            title: `${cleanArea} 路地裏の隠れ家ビストロ・予約推奨店`,
            type: 'meal',
            location: `${cleanArea} 隠れ家レストラン`,
            cost: 2400,
            memo: `【★4.5 / 地元民おすすめ】観光客が少ないエリアにある実力派レストラン。地産地消のこだわりランチが絶品。`,
          },
          {
            date: d1,
            time: '14:30',
            title: `${cleanArea} 現代美術館・静寂の日本庭園`,
            type: 'sightseeing',
            location: `${cleanArea} 美術館`,
            cost: 1200,
            memo: `【★4.4 / 大人の休日スポット】美しい建築と自然に囲まれた美術館。併設のミュージアムカフェも穴場です。`,
          },
          {
            date: d2,
            time: '11:00',
            title: `${cleanArea} 自家焙煎スペシャルティ珈琲店（モーニング）`,
            type: 'meal',
            location: `${cleanArea} 自家焙煎珈琲`,
            cost: 1400,
            memo: `【★4.5 / コーヒー好き必見】丁寧なハンドドリップ珈琲と厚切りトーストで贅沢な朝時間を過ごせます。`,
          },
        ],
        active: [
          {
            date: d1,
            time: '09:30',
            title: `${cleanArea}駅 集合・アクティビティ拠点へ移動`,
            type: 'transport',
            location: `${cleanArea}駅`,
            cost: 3000,
            memo: '動きやすい服装とスニーカーで集合！',
          },
          {
            date: d1,
            time: '11:00',
            title: `${cleanArea}の大自然・伝統工芸ワークショップ体験`,
            type: 'active',
            location: `${cleanArea} 体験施設`,
            cost: 3800,
            memo: `【★4.6 / 思い出作りに最適】初心者でもインストラクター付きで安心。旅の記念に残る体験アクティビティ。`,
          },
          {
            date: d1,
            time: '13:30',
            title: `${cleanArea} 名物ご当地グルメ横丁・食べ歩き`,
            type: 'meal',
            location: `${cleanArea} グルメ横丁`,
            cost: 2500,
            memo: `【★4.3 / 活気ある人気スポット】地元名物のB級グルメや地酒をハシゴして楽しめる賑やかなエリア。`,
          },
          {
            date: d1,
            time: '16:00',
            title: `${cleanArea} パノラマ展望台（サンセット絶景）`,
            type: 'sightseeing',
            location: `${cleanArea} 展望台`,
            cost: 800,
            memo: `【★4.5 / 夕暮れ時がベスト】街並みと自然を一望できる絶景展望スポット。`,
          },
        ],
      });

      const selectedSet = matchedKey
        ? CURATED_SPOTS[matchedKey]
        : buildFallbackPlans();
      const seasonalSpot = seasonInfo.spotBonus[matchedKey || 'default'];
      const seasonalEvent = {
        date: d1,
        time: '16:15',
        title: matchedKey
          ? seasonalSpot.title
          : `${cleanArea}の${seasonalSpot.title}`,
        type: 'sightseeing',
        location: matchedKey
          ? seasonalSpot.location
          : `${cleanArea} ${seasonalSpot.location}`,
        cost: 800,
        memo: `${seasonalSpot.memo} ${companionNote}`,
      };

      const isSoloPlan = companion === 'ひとり旅' && headcount === 1;
      const groupLabel = isSoloPlan
        ? 'ひとり旅'
        : `${companion}（${headcount}名）`;

      const enrichEvents = (list, addSeasonal = false) => {
        const cloned = list.map((ev, idx) =>
          idx === 0 ? { ...ev, memo: `${ev.memo} ${companionNote}` } : { ...ev }
        );
        if (addSeasonal) {
          cloned.splice(Math.min(3, cloned.length), 0, seasonalEvent);
        }
        return cloned;
      };

      setSuggestions([
        {
          tag: `王道・${seasonInfo.name}のベストコース`,
          title: `【${seasonInfo.tagPrefix}】${groupLabel}で行く${where}の王道${theme}旅`,
          destination: where,
          startDate: d1,
          endDate: d2,
          budget: budgetNum,
          isSoloPlan,
          summary: `${seasonInfo.tip} ${groupLabel}でも快適に巡れる高評価（★4.3以上）の名店と、${seasonInfo.name}ならではの絶景スポットを組み合わせた満足度No.1プランです。`,
          events: enrichEvents(selectedSet.royal, true),
        },
        {
          tag: `穴場・${groupLabel}向けゆったり`,
          title: `【穴場】${groupLabel}で味わう${where}の隠れ家名店巡り`,
          destination: where,
          startDate: d1,
          endDate: d2,
          budget: Math.round(budgetNum * 0.9),
          isSoloPlan,
          summary: `人混みを避けて${groupLabel}のペースでゆったり過ごせる隠れ家レストランや静かな名刹・美術館を中心に組んだ通好みのプラン。`,
          events: enrichEvents(selectedSet.hidden, false),
        },
        {
          tag: `体験・${seasonInfo.name}の絶景満喫`,
          title: `【体験】${where}の${seasonInfo.name}絶景アクティビティ＆食べ歩き`,
          destination: where,
          startDate: d1,
          endDate: d2,
          budget: Math.round(budgetNum * 1.05),
          isSoloPlan,
          summary: `${seasonInfo.name}の気候を活かした体験アクティビティと、${groupLabel}で盛り上がる写真映えスポット・ご当地グルメを詰め込んだ充実コース！`,
          events: enrichEvents(selectedSet.active, true),
        },
      ]);
      setStep(3);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[260] flex justify-center items-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-stone-400 hover:bg-stone-100 rounded-full z-10"
        >
          <X size={20} />
        </button>

        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" />{' '}
              AIおまかせプラン作成
            </h3>
            <p className="text-xs text-stone-500">
              行き先・同行者・季節に合わせて、タイムライン付きの旅行プランを自動作成します。
            </p>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                行きたい都道府県・エリア
              </label>
              <input
                type="text"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder="例: 京都府 / 箱根 / 北海道"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-[11px] font-bold text-stone-500">
                  誰と行く？・人数
                </label>
                <div className="flex items-center gap-2 bg-stone-100 px-2.5 py-1 rounded-full">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, headcount - 1);
                      setHeadcount(next);
                      if (next === 1) setCompanion('ひとり旅');
                    }}
                    className="w-5 h-5 rounded-full bg-white text-stone-700 font-bold text-xs flex items-center justify-center shadow-2xs hover:bg-stone-50 active:scale-95"
                  >
                    −
                  </button>
                  <span className="text-xs font-extrabold text-stone-800 min-w-[34px] text-center">
                    {headcount}人
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(20, headcount + 1);
                      setHeadcount(next);
                      if (companion === 'ひとり旅' && next > 1)
                        setCompanion('友達・グループ');
                    }}
                    className="w-5 h-5 rounded-full bg-white text-stone-700 font-bold text-xs flex items-center justify-center shadow-2xs hover:bg-stone-50 active:scale-95"
                  >
                    ＋
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMPANIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCompanion(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      companion === c.id
                        ? 'bg-[#7A9D8C] text-white border-[#7A9D8C] shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1.5 block pl-1">
                旅のテーマ
              </label>
              <div className="flex flex-wrap gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      theme === t
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                    出発日
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">
                    帰宅日
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <div className="mt-2 px-3 py-1.5 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-center justify-between text-[11px] font-bold text-amber-800">
                <span>出発日の季節を自動反映：</span>
                <span>{seasonInfo.badge}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1.5 block pl-1">
                1人あたりの予算目安（円）
              </label>
              <div className="relative mb-2">
                <Banknote
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="例: 50000"
                  className="w-full p-2.5 pl-9 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '〜3万円', value: '30000' },
                  { label: '〜5万円', value: '50000' },
                  { label: '〜8万円', value: '80000' },
                  { label: '〜10万円', value: '100000' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setBudgetLimit(preset.value)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                      budgetLimit === preset.value
                        ? 'bg-stone-800 text-white border-stone-800 shadow-2xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-3.5 bg-amber-500 text-white font-bold rounded-2xl shadow-sm hover:bg-amber-600 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> プランを提案してもらう
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-4" />
            <h4 className="font-bold text-stone-800 mb-1">
              {where}のプランを組み立て中...
            </h4>
            <p className="text-xs text-stone-400">
              おすすめのタイムラインを生成しています
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center pr-6">
              <h3 className="font-bold text-base text-stone-800 flex items-center gap-1.5">
                <Sparkles size={18} className="text-amber-500" /> AI提案プラン (
                {suggestions.length}件)
              </h3>
              <button
                onClick={() => setStep(1)}
                className="text-[11px] font-bold text-stone-400 hover:text-stone-600 underline"
              >
                条件を変える
              </button>
            </div>

            <div className="space-y-3.5">
              {suggestions.map((plan, idx) => (
                <div
                  key={idx}
                  className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 shadow-xs"
                >
                  <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full mb-1.5">
                    {plan.tag}
                  </span>
                  <h4 className="font-bold text-sm text-stone-800 mb-1">
                    {plan.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {plan.summary}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPlanIdx(expandedPlanIdx === idx ? null : idx)
                    }
                    className="w-full py-2 mb-3 bg-white text-stone-600 border border-stone-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-stone-100 transition-colors"
                  >
                    <span>
                      {expandedPlanIdx === idx
                        ? 'スケジュール詳細を閉じる'
                        : `スケジュール詳細を見る (${plan.events.length}件)`}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${
                        expandedPlanIdx === idx ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {expandedPlanIdx === idx && (
                    <div className="mb-3 bg-white p-3 rounded-xl border border-stone-100 space-y-2.5 animate-in fade-in">
                      {plan.events.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          className="flex items-start gap-2 text-[11px] border-b border-stone-100 pb-2.5 last:border-none last:pb-0"
                        >
                          <span className="font-mono font-bold text-[#7A9D8C] shrink-0 mt-0.5">
                            {ev.time}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-stone-800">
                              {ev.title}
                            </p>
                            {ev.memo && (
                              <p className="text-[10px] text-stone-600 bg-stone-50 p-1.5 rounded-lg mt-1 leading-relaxed">
                                {ev.memo}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-1 mt-1.5">
                              <p className="text-[10px] text-stone-400 font-bold">
                                {ev.location}{' '}
                                {ev.cost > 0
                                  ? `/ 目安 ¥${ev.cost.toLocaleString()}`
                                  : ''}
                              </p>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  ev.location || ev.title
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-md transition-colors shrink-0"
                              >
                                <ExternalLink size={10} /> Googleマップで確認
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className="w-full py-2.5 bg-[#7A9D8C] text-white font-bold rounded-xl text-xs shadow-xs hover:bg-[#688a79] transition-colors"
                  >
                    このプランをしおりに反映する
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JoinTripWizard({ currentUser, trips, setTrips, onClose, onOpenTrip }) {
  const [step, setStep] = useState(1);
  const [joinCode, setJoinCode] = useState('');
  const [foundTrip, setFoundTrip] = useState(null);
  const [myColor, setMyColor] = useState(PRESET_COLORS[1]);
  const handleCheckCode = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const existing = trips.find((t) => t.id === code);
    if (existing) {
      setFoundTrip(existing);
      setStep(2);
    } else {
      setFoundTrip({
        id: code,
        title: '友達の旅行計画',
        destination: '京都府',
        startDate: getTodayString(),
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        budget: 50000,
        members: [{ id: 'f1', name: '友達', color: PRESET_COLORS[0] }],
        isSoloTrip: false,
        events: [],
        photos: [],
      });
      setStep(2);
    }
  };
  const handleJoin = () => {
    const isAlreadyMember = (foundTrip.members || []).some(
      (m) => m.id === currentUser.id
    );
    const updatedTrip = {
      ...foundTrip,
      isSoloTrip: false,
      members: isAlreadyMember
        ? foundTrip.members
        : [...(foundTrip.members || []), { ...currentUser, color: myColor }],
    };
    if (trips.some((t) => t.id === updatedTrip.id))
      setTrips(trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    else setTrips([updatedTrip, ...trips]);
    onOpenTrip(updatedTrip.id, false);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg text-stone-800">
            {step === 1 ? 'コードで参加' : 'カラーの選択'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        {step === 1 ? (
          <div>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="例: TABI-XXXXXXXX"
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl uppercase font-mono text-center text-sm font-bold mb-5"
            />
            <button
              onClick={handleCheckCode}
              className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm"
            >
              しおりを探す
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <label className="text-[11px] text-stone-500 font-bold mb-2 block text-center">
                あなたのメンバーカラー
              </label>
              <div className="flex gap-2.5 justify-center">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setMyColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      myColor === color
                        ? 'scale-110 ring-2 ring-offset-2 ring-stone-700'
                        : 'opacity-60'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleJoin}
              className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm"
            >
              参加する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function UserSettingsModal({
  currentUser,
  user: userProp,
  publicTrips = [],
  onToggleFollow,
  onOpenUserProfile,
  onUpgradeUser,
  onClose,
  onLogout,
}) {
  const user = currentUser || userProp || {};
  const [currentView, setCurrentView] = useState('menu');
  const [followListTab, setFollowListTab] = useState('following');
  const [name, setName] = useState(user?.isGuest ? '' : user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [userId, setUserId] = useState(user?.isGuest ? '' : user?.id || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(
    user?.password || (user?.isGuest ? '' : 'password123')
  );
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passkeys, setPasskeys] = useState(
    Array.isArray(user?.passkeys) ? user.passkeys : []
  );
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  // パスワードを忘れた方ページ用のステート
  const [forgotStep, setForgotStep] = useState(1); // 1: メール送信, 2: コード＆新PW入力
  const [resetEmailInput, setResetEmailInput] = useState(user?.email || '');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetNewPwInput, setResetNewPwInput] = useState('');
  const [resetConfirmPwInput, setResetConfirmPwInput] = useState('');

  const [residence, setResidence] = useState(user?.residence || '未設定');
  const [city, setCity] = useState(user?.city || '');
  const [station, setStation] = useState(user?.station || '');
  const [selectedPreset, setSelectedPreset] = useState(
    user?.avatar || FEMALE_AVATARS[0]
  );
  const [customAvatar, setCustomAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const isIdTaken =
    ['admin', 'test', 'user'].includes((userId || '').toLowerCase()) &&
    userId !== user?.id;

  const handleSaveAccount = () => {
    if (!name.trim() || !userId.trim() || isIdTaken) {
      customAlert('名前と有効なIDを入力してください');
      return;
    }
    if (onUpgradeUser) {
      onUpgradeUser({
        ...user,
        id: userId.trim(),
        name: name.trim(),
        bio: bio.trim(),
        email: email.trim(),
        password: password.trim(),
        passkeys,
        residence,
        city: city.trim(),
        station: station.trim(),
        avatar: customAvatar || selectedPreset,
        isGuest: false,
      });
    }
    customAlert('プロフィールを保存しました！');
    setCurrentView('menu');
  };

  const handleSaveSecurity = () => {
    if (!email.trim()) {
      customAlert('メールアドレスを入力してください');
      return;
    }

    let updatedPassword = password.trim();
    const isTryingToChangePw = Boolean(
      currentPasswordInput.trim() ||
        newPassword.trim() ||
        confirmNewPassword.trim()
    );

    if (user?.isGuest && !password) {
      if (!newPassword.trim() || newPassword.trim().length < 8) {
        customAlert('8文字以上のパスワードを設定してください');
        return;
      }
      if (newPassword.trim() !== confirmNewPassword.trim()) {
        customAlert('確認用パスワードが一致しません');
        return;
      }
      updatedPassword = newPassword.trim();
    } else if (isTryingToChangePw) {
      if (!currentPasswordInput.trim()) {
        customAlert(
          'パスワードを変更するには「現在のパスワード」を入力してください'
        );
        return;
      }
      if (password && currentPasswordInput.trim() !== password) {
        customAlert(
          '現在のパスワードが正しくありません。忘れた場合は「パスワードを忘れた方はこちら」から再設定してください。'
        );
        return;
      }
      if (newPassword.trim().length < 8) {
        customAlert('新しいパスワードは8文字以上で入力してください');
        return;
      }
      if (newPassword.trim() !== confirmNewPassword.trim()) {
        customAlert('新しいパスワードと確認用パスワードが一致しません');
        return;
      }
      updatedPassword = newPassword.trim();
    }

    setPassword(updatedPassword);
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmNewPassword('');

    if (onUpgradeUser) {
      onUpgradeUser({
        ...user,
        email: email.trim(),
        password: updatedPassword,
        passkeys,
        isGuest: user?.isGuest ? false : user?.isGuest,
      });
    }
    customAlert(
      isTryingToChangePw
        ? 'メールアドレスと新しいパスワードを保存しました！'
        : 'セキュリティ設定を保存しました！'
    );
    setCurrentView('menu');
  };

  // パスキー（WebAuthn風）の新規登録ハンドラー
  const handleAddPasskey = async () => {
    if (isRegisteringPasskey) return;
    setIsRegisteringPasskey(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const deviceLabel = /iPhone|iPad|Macintosh/.test(ua)
        ? 'Apple iCloud キーチェーン (Face ID / Touch ID)'
        : /Android/.test(ua)
        ? 'Google パスワードマネージャー (生体認証)'
        : 'このデバイスのパスキー (Windows Hello / Touch ID)';

      const newPk = {
        id: 'pk_' + generateId(),
        name: `${deviceLabel}`,
        createdAt: new Date().toLocaleDateString('ja-JP'),
      };
      const nextPasskeys = [...passkeys, newPk];
      setPasskeys(nextPasskeys);
      if (onUpgradeUser) {
        onUpgradeUser({ ...user, passkeys: nextPasskeys });
      }
      customAlert(
        '新しいパスキーを登録しました！次回から生体認証等で素早くログインできます。'
      );
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleRemovePasskey = (pkId) => {
    const nextPasskeys = passkeys.filter((p) => p.id !== pkId);
    setPasskeys(nextPasskeys);
    if (onUpgradeUser) {
      onUpgradeUser({ ...user, passkeys: nextPasskeys });
    }
    customAlert('パスキーを削除しました');
  };

  // パスワード再設定完了ハンドラー
  const handleCompletePasswordReset = () => {
    if (!resetCodeInput.trim()) {
      customAlert('メールに届いた6桁の認証コードを入力してください');
      return;
    }
    if (resetNewPwInput.trim().length < 8) {
      customAlert('新しいパスワードは8文字以上で入力してください');
      return;
    }
    if (resetNewPwInput.trim() !== resetConfirmPwInput.trim()) {
      customAlert('確認用パスワードが一致しません');
      return;
    }
    const updatedPw = resetNewPwInput.trim();
    setPassword(updatedPw);
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetCodeInput('');
    setResetNewPwInput('');
    setResetConfirmPwInput('');
    setForgotStep(1);
    if (onUpgradeUser) {
      onUpgradeUser({
        ...user,
        email: resetEmailInput.trim() || email.trim(),
        password: updatedPw,
        passkeys,
        isGuest: false,
      });
    }
    customAlert('パスワードの再設定が完了しました！');
    setCurrentView('security');
  };

  // IDからユーザー情報（名前・アイコン・自己紹介）を解決するヘルパー
  const resolveUserById = (uid) => {
    const matchedTrip = (publicTrips || []).find(
      (t) => (t.authorId || t.members?.[0]?.id) === uid
    );
    if (matchedTrip) {
      return {
        id: uid,
        name: matchedTrip.authorName || uid,
        avatar: matchedTrip.authorAvatar || FEMALE_AVATARS[0],
        bio:
          matchedTrip.authorBio ||
          `${matchedTrip.destination || '日本各地'}を旅しています！`,
      };
    }
    const PRESET_PROFILES = {
      m1: {
        id: 'm1',
        name: 'アクティブ夫婦',
        avatar: FEMALE_AVATARS[0],
        bio: '週末は全国の絶景とアクティビティを求めて夫婦で旅しています！',
      },
      m2: {
        id: 'm2',
        name: 'たびたろう',
        avatar: MALE_AVATARS[1],
        bio: '温泉と美味しいお酒が大好き。関東近郊のんびり旅メインです♨️',
      },
      m3: {
        id: 'm3',
        name: 'くいしんぼう',
        avatar: FEMALE_AVATARS[2],
        bio: '食べるために旅をする！全国のローカルグルメ・カフェを開拓中🍰',
      },
      m4: {
        id: 'm4',
        name: '北陸さんぽ',
        avatar: FEMALE_AVATARS[3],
        bio: '北陸の美味しい海鮮と和菓子を探して旅しています🍣',
      },
      m5: {
        id: 'm5',
        name: 'ちゅら旅',
        avatar: MALE_AVATARS[2],
        bio: '離島と青い海が大好き！年に3回は沖縄に行きます🌺',
      },
    };
    return (
      PRESET_PROFILES[uid] || {
        id: uid,
        name: uid,
        avatar: MALE_AVATARS[0],
        bio: 'たびたびユーザー',
      }
    );
  };

  const followingIds = Array.isArray(user?.following) ? user.following : [];
  const followerIds = Array.isArray(user?.followers) ? user.followers : [];
  const myPublicPostCount = (publicTrips || []).filter(
    (t) => (t.authorId || t.members?.[0]?.id) === user?.id
  ).length;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full pb-safe h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {currentView === 'menu' && (
          <div className="flex flex-col h-full animate-in fade-in">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-base text-stone-800">
                プロフィール・設定
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              {user?.isGuest ? (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <h4 className="font-bold text-red-600 text-xs mb-1 flex items-center gap-1.5">
                    <AlertCircle size={14} /> ゲストモード制限中
                  </h4>
                  <p className="text-[10px] text-red-500">
                    アカウント登録するとすべての機能が使えます。下のメニューから設定してください。
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden mb-6">
                  {/* SNS風ヘッダーバナー */}
                  <div className="h-20 bg-gradient-to-r from-[#7A9D8C]/30 via-[#8FA8C8]/25 to-[#E2A98B]/25 pointer-events-none" />

                  <div className="px-5 pb-5 relative z-10">
                    {/* アイコン＆プロフィール編集ボタン */}
                    <div className="flex justify-between items-end -mt-10 mb-3">
                      <div className="rounded-full p-1 bg-white shadow-sm">
                        <UserAvatar user={user} size="w-20 h-20 text-2xl" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentView('account')}
                        className="relative z-20 cursor-pointer px-4 py-2 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all active:scale-95 shadow-sm"
                      >
                        プロフィールを編集
                      </button>
                    </div>

                    {/* 名前・ユーザーID */}
                    <div className="mb-3">
                      <h3 className="font-extrabold text-lg text-stone-900 leading-tight">
                        {user?.name}
                      </h3>
                      <p className="text-xs text-stone-400 font-mono">
                        @{user?.id}
                      </p>
                    </div>

                    {/* 自己紹介文 */}
                    {user?.bio && (
                      <p className="text-xs text-stone-700 leading-relaxed mb-4 whitespace-pre-wrap">
                        {user.bio}
                      </p>
                    )}

                    {/* X / Instagram 風のフォロー・フォロワー・投稿数スタッツバー */}
                    <div className="flex items-center gap-6 pt-3 border-t border-stone-100">
                      <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-sm text-stone-900">
                          {myPublicPostCount}
                        </span>
                        <span className="text-xs text-stone-500">
                          公開しおり
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFollowListTab('following');
                          setCurrentView('followList');
                        }}
                        className="flex items-baseline gap-1 group cursor-pointer hover:opacity-75 transition-opacity"
                      >
                        <span className="font-extrabold text-sm text-stone-900 group-hover:underline">
                          {followingIds.length}
                        </span>
                        <span className="text-xs text-stone-500">
                          フォロー中
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFollowListTab('followers');
                          setCurrentView('followList');
                        }}
                        className="flex items-baseline gap-1 group cursor-pointer hover:opacity-75 transition-opacity"
                      >
                        <span className="font-extrabold text-sm text-stone-900 group-hover:underline">
                          {followerIds.length}
                        </span>
                        <span className="text-xs text-stone-500">
                          フォロワー
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView('account')}
                  className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                    <User size={18} className="text-[#7A9D8C]" />{' '}
                    {user?.isGuest
                      ? 'アカウントを作成（プロフィール）'
                      : 'プロフィール・居住地設定'}
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
                <button
                  onClick={() => setCurrentView('security')}
                  className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-[#7A9D8C]" />{' '}
                    メールアドレス・パスワード設定
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
                <div className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                  <div className="pr-3">
                    <div className="flex items-center gap-2 text-stone-700 font-bold text-sm">
                      <Compass size={18} className="text-[#7A9D8C]" />{' '}
                      しおりの自動ミニ化
                    </div>
                    <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                      自分のしおりから戻る時に小さいアイコンとして画面に残す
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !(user?.autoMinimizeTrip !== false);
                      if (onUpgradeUser)
                        onUpgradeUser({ ...user, autoMinimizeTrip: nextVal });
                      customAlert(
                        nextVal
                          ? 'しおりの自動ミニ化をONにしました'
                          : 'しおりの自動ミニ化をOFFにしました'
                      );
                    }}
                    className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 flex items-center ${
                      user?.autoMinimizeTrip !== false
                        ? 'bg-[#7A9D8C] justify-end'
                        : 'bg-stone-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                <button
                  onClick={() => setCurrentView('notifications')}
                  className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                    <Bell size={18} className="text-[#7A9D8C]" /> 通知設定
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
                <button
                  onClick={() => setCurrentView('location')}
                  className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                    <MapPin size={18} className="text-[#7A9D8C]" /> 位置情報設定
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 shrink-0">
              <button
                onClick={onLogout}
                className="w-full py-3.5 bg-red-50 text-red-500 font-bold rounded-2xl shadow-sm hover:bg-red-100 transition-colors flex justify-center items-center gap-2 text-sm"
              >
                <LogOut size={16} /> ログアウト
              </button>
            </div>
          </div>
        )}

        {currentView === 'followList' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <button
                onClick={() => setCurrentView('menu')}
                className="p-1.5 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full"
              >
                <ChevronLeft size={22} />
              </button>
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 leading-tight">
                  {user?.name}
                </h3>
                <p className="text-[11px] text-stone-400 font-mono">
                  @{user?.id}
                </p>
              </div>
            </div>

            {/* SNS風のアンダーライン付きタブ */}
            <div className="flex border-b border-stone-200 mb-3 shrink-0">
              <button
                type="button"
                onClick={() => setFollowListTab('following')}
                className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-colors ${
                  followListTab === 'following'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {followingIds.length} フォロー中
              </button>
              <button
                type="button"
                onClick={() => setFollowListTab('followers')}
                className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-colors ${
                  followListTab === 'followers'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {followerIds.length} フォロワー
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-stone-100 pb-4">
              {(followListTab === 'following' ? followingIds : followerIds)
                .length === 0 ? (
                <div className="py-16 text-center text-xs font-bold text-stone-400">
                  {followListTab === 'following'
                    ? 'まだフォローしているユーザーはいません'
                    : 'まだフォロワーはいません'}
                </div>
              ) : (
                (followListTab === 'following'
                  ? followingIds
                  : followerIds
                ).map((uid) => {
                  const targetUser = resolveUserById(uid);
                  const isFollowingBack = followingIds.includes(uid);
                  const isFollower = followerIds.includes(uid);
                  return (
                    <div
                      key={uid}
                      className="py-3.5 px-1 flex items-start justify-between gap-3 hover:bg-stone-50/70 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onOpenUserProfile && onOpenUserProfile(targetUser)
                        }
                        className="flex items-start gap-3 min-w-0 flex-1 text-left"
                      >
                        <img
                          src={targetUser.avatar}
                          alt={targetUser.name}
                          className="w-11 h-11 rounded-full object-cover border border-stone-200 bg-stone-100 shrink-0 mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-extrabold text-stone-900 truncate hover:underline">
                              {targetUser.name}
                            </p>
                            {isFollower && (
                              <span className="text-[9px] font-bold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded shrink-0">
                                フォローされています
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 font-mono">
                            @{targetUser.id}
                          </p>
                          {targetUser.bio && (
                            <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 leading-snug">
                              {targetUser.bio}
                            </p>
                          )}
                        </div>
                      </button>

                      {onToggleFollow && (
                        <button
                          type="button"
                          onClick={() =>
                            onToggleFollow(targetUser.id, targetUser.name)
                          }
                          className={`shrink-0 mt-1 px-4 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                            isFollowingBack
                              ? 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'
                              : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
                          }`}
                        >
                          {isFollowingBack ? 'フォロー中' : 'フォローバック'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {currentView === 'account' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-5 shrink-0">
              <button
                onClick={() => setCurrentView('menu')}
                className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"
              >
                <ChevronLeft size={22} />
              </button>
              <h3 className="font-bold text-lg text-stone-800">
                {user?.isGuest
                  ? 'アカウントを作成'
                  : 'プロフィール・居住地設定'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-400"
                  >
                    {customAvatar || selectedPreset ? (
                      <img
                        src={customAvatar || selectedPreset}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera size={20} className="mb-0.5" />
                        <span className="text-[10px] font-bold">変更する</span>
                      </div>
                    )}
                  </button>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#7A9D8C] text-white rounded-full flex items-center justify-center shadow-md pointer-events-none">
                    <Camera size={13} />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        setCustomAvatar(URL.createObjectURL(e.target.files[0]));
                    }}
                    className="hidden"
                  />
                </div>
                <div className="w-full space-y-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 text-center">
                    イラストアイコンから選ぶ
                  </p>
                  <div className="flex justify-center gap-2">
                    {FEMALE_AVATARS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(url);
                          setCustomAvatar(null);
                        }}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          selectedPreset === url && !customAvatar
                            ? 'border-[#7A9D8C] scale-110 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt="female"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2">
                    {MALE_AVATARS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(url);
                          setCustomAvatar(null);
                        }}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          selectedPreset === url && !customAvatar
                            ? 'border-[#7A9D8C] scale-110 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt="male"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                    ニックネーム
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                    自己紹介文（プロフィールに表示）
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="3"
                    placeholder="好きな旅のスタイルや行きたい場所など..."
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                    ユーザーID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className={`w-full p-3 pr-10 bg-stone-50 rounded-xl border ${
                        userId && isIdTaken
                          ? 'border-red-300 focus:ring-red-400'
                          : 'border-stone-200 focus:ring-[#7A9D8C]'
                      } text-sm font-bold focus:outline-none focus:ring-2 font-mono`}
                      placeholder="半角英数字"
                    />
                    {userId && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isIdTaken ? (
                          <XCircle size={18} className="text-red-500" />
                        ) : (
                          <CheckCircle2 size={18} className="text-[#7A9D8C]" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                    居住地・最寄り駅
                  </label>
                  <div className="space-y-2">
                    <select
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    >
                      <option value="未設定">都道府県を選択 (未設定)</option>
                      {PREFECTURES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="市区町村 (例: 渋谷区)"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                    <StationSearchInput
                      value={station}
                      onChange={setStation}
                      cityContext={city}
                      prefectureContext={residence}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 shrink-0">
              <button
                onClick={handleSaveAccount}
                disabled={user?.isGuest && (!name.trim() || !userId.trim())}
                className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm hover:bg-[#688a79] transition-colors text-sm disabled:opacity-50"
              >
                {user?.isGuest ? 'プロフィールを登録する' : '変更を保存'}
              </button>
            </div>
          </div>
        )}

        {currentView === 'security' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <button
                onClick={() => setCurrentView('menu')}
                className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"
              >
                <ChevronLeft size={22} />
              </button>
              <h3 className="font-bold text-lg text-stone-800">
                メールアドレス・パスワード設定
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1 space-y-5">
              <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-600 leading-relaxed">
                ログインやアカウント引き継ぎに使用するメールアドレス・パスワード、およびパスキー（生体認証）を管理できます。
              </div>

              {/* ① メールアドレス設定 */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
                <label className="block text-xs font-extrabold text-stone-700">
                  登録メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@example.com"
                  className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>

              {/* ② パスワード変更セクション（現在のパスワード入力必須） */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                    🔒 {password ? 'パスワードの変更' : '新規パスワードの設定'}
                  </h4>
                  {password && (
                    <span className="text-[10px] text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Check size={11} strokeWidth={3} /> 設定済み
                    </span>
                  )}
                </div>

                {password && (
                  <div>
                    <div className="flex justify-between items-center mb-1 pl-1">
                      <label className="text-[11px] font-bold text-stone-500">
                        現在のパスワード（変更時必須）
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmailInput(email);
                          setForgotStep(1);
                          setCurrentView('forgotPassword');
                        }}
                        className="text-[11px] font-bold text-[#7A9D8C] hover:underline"
                      >
                        パスワードを忘れた方はこちら
                      </button>
                    </div>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="現在のパスワードを入力"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1 pl-1">
                    {password ? '新しいパスワード' : 'パスワードを設定'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8文字以上の半角英数字"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1 pl-1">
                    {password
                      ? '新しいパスワード（確認用）'
                      : 'パスワード（確認用）'}
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="もう一度新しいパスワードを入力"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>
              </div>

              {/* ③ パスキー（Passkey）設定セクション */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                      🔑 パスキー（生体認証ログイン）の設定
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      Face ID / Touch ID
                      や画面ロックを使って、パスワード入力なしで安全・スピーディーにログインできます。
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      passkeys.length > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {passkeys.length > 0
                      ? `${passkeys.length}件登録中`
                      : '未登録'}
                  </span>
                </div>

                {passkeys.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {passkeys.map((pk) => (
                      <div
                        key={pk.id}
                        className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-800 truncate">
                            {pk.name}
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold">
                            登録日: {pk.createdAt}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePasskey(pk.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="パスキーを削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddPasskey}
                  disabled={isRegisteringPasskey}
                  className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 shadow-2xs"
                >
                  {isRegisteringPasskey ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>デバイスで認証中...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>この端末のパスキーを新しく登録する</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 shrink-0">
              <button
                onClick={handleSaveSecurity}
                disabled={
                  !email.trim() ||
                  (user?.isGuest && !password && !newPassword.trim())
                }
                className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm hover:bg-[#688a79] transition-colors text-sm disabled:opacity-50"
              >
                メールアドレス・パスワードを保存
              </button>
            </div>
          </div>
        )}

        {/* パスワードを忘れた方の再設定ページ */}
        {currentView === 'forgotPassword' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-5 shrink-0">
              <button
                onClick={() => setCurrentView('security')}
                className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"
              >
                <ChevronLeft size={22} />
              </button>
              <h3 className="font-bold text-lg text-stone-800">
                パスワードを忘れた方（再設定）
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1 space-y-4">
              {forgotStep === 1 ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold mb-1">
                      📩 メール認証でパスワードをリセットします
                    </p>
                    <p className="text-[11px] text-amber-800">
                      ご登録のメールアドレス宛に6桁の認証コードを送信します。現在のパスワードがわからなくても新しく設定し直すことができます。
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                      送信先メールアドレス
                    </label>
                    <input
                      type="email"
                      value={resetEmailInput}
                      onChange={(e) => setResetEmailInput(e.target.value)}
                      placeholder="mail@example.com"
                      className="w-full p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!resetEmailInput.trim()) {
                        customAlert('メールアドレスを入力してください');
                        return;
                      }
                      customAlert(
                        `${resetEmailInput} 宛に認証コード（123456）を送信しました！`
                      );
                      setForgotStep(2);
                    }}
                    className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm hover:bg-[#688a79] transition-colors text-sm"
                  >
                    認証コードを送信する
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="p-3.5 bg-[#7A9D8C]/10 border border-[#7A9D8C]/25 rounded-2xl text-xs text-[#557465] font-bold leading-relaxed">
                    「{resetEmailInput}
                    」に届いた6桁の認証コードと、新しく設定したいパスワードを入力してください。
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                      認証コード（6桁）
                    </label>
                    <input
                      type="text"
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                      placeholder="例: 123456"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-base font-mono font-extrabold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                      新しいパスワード
                    </label>
                    <input
                      type="password"
                      value={resetNewPwInput}
                      onChange={(e) => setResetNewPwInput(e.target.value)}
                      placeholder="8文字以上の半角英数字"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">
                      新しいパスワード（確認用）
                    </label>
                    <input
                      type="password"
                      value={resetConfirmPwInput}
                      onChange={(e) => setResetConfirmPwInput(e.target.value)}
                      placeholder="もう一度新しいパスワードを入力"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCompletePasswordReset}
                    className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm hover:bg-[#688a79] transition-colors text-sm"
                  >
                    新しいパスワードで再設定する
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-full py-2 text-xs font-bold text-stone-400 hover:text-stone-600"
                  >
                    メールアドレスの入力に戻る
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {(currentView === 'notifications' || currentView === 'location') && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-6 shrink-0">
              <button
                onClick={() => setCurrentView('menu')}
                className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"
              >
                <ChevronLeft size={22} />
              </button>
              <h3 className="font-bold text-lg text-stone-800">
                {currentView === 'notifications' ? '通知設定' : '位置情報設定'}
              </h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <Info size={40} className="text-stone-300 mb-4" />
              <h4 className="font-bold text-stone-600 mb-2">準備中です</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                この機能は現在開発中です。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 他ユーザーのプロフィール画面モーダル
function PublicUserProfileModal({
  userProfile,
  publicTrips,
  currentUser,
  onToggleFollow,
  onOpenTrip,
  onClose,
}) {
  const userPosts = publicTrips.filter(
    (t) => (t.authorId || t.members?.[0]?.id) === userProfile.id
  );
  const isMe = userProfile.id === currentUser.id;
  const isFollowing =
    Array.isArray(currentUser.following) &&
    currentUser.following.includes(userProfile.id);
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[220] flex justify-center items-end sm:items-center p-0 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full pb-safe h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-base text-stone-800">
            ユーザープロフィール
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <div className="bg-stone-50/90 p-5 rounded-3xl border border-stone-100 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={userProfile.avatar || FEMALE_AVATARS[0]}
                  alt={userProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-white shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-lg text-stone-800 truncate">
                    {userProfile.name}
                  </h4>
                  <p className="text-xs text-stone-400 font-mono">
                    @{userProfile.id}
                  </p>
                </div>
              </div>
              {!isMe && (
                <button
                  type="button"
                  onClick={() =>
                    onToggleFollow(userProfile.id, userProfile.name)
                  }
                  style={
                    isFollowing
                      ? {
                          backgroundColor: '#7A9D8C',
                          color: '#ffffff',
                          borderColor: '#7A9D8C',
                        }
                      : {
                          backgroundColor: '#ffffff',
                          color: '#44403c',
                          borderColor: '#d6d3d1',
                        }
                  }
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all shadow-2xs flex items-center gap-1"
                >
                  {isFollowing ? (
                    <>
                      <Check size={13} strokeWidth={3} /> フォロー中
                    </>
                  ) : (
                    '+ フォロー'
                  )}
                </button>
              )}
            </div>

            {userProfile.bio && (
              <p className="text-xs text-stone-600 leading-relaxed mb-4 bg-white p-3 rounded-2xl border border-stone-100">
                {userProfile.bio}
              </p>
            )}

            <div className="flex justify-around bg-white py-2.5 rounded-2xl border border-stone-100 text-center">
              <div>
                <p className="text-sm font-extrabold text-stone-800">
                  {userPosts.length}
                </p>
                <p className="text-[10px] font-bold text-stone-400">
                  公開しおり
                </p>
              </div>
              <div className="border-x border-stone-100 px-6">
                <p className="text-sm font-extrabold text-stone-800">
                  {totalLikes}
                </p>
                <p className="text-[10px] font-bold text-stone-400">
                  累計いいね
                </p>
              </div>
              <div>
                <p className="text-sm font-extrabold text-stone-800">
                  {(isFollowing ? 1 : 0) + 24}
                </p>
                <p className="text-[10px] font-bold text-stone-400">
                  フォロワー
                </p>
              </div>
            </div>
          </div>

          <h4 className="text-xs font-bold text-stone-500 mb-3 pl-1 flex items-center gap-1.5">
            <Globe size={14} className="text-[#7A9D8C]" /> 公開中のしおり (
            {userPosts.length})
          </h4>
          {userPosts.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400 font-bold bg-stone-50 rounded-2xl">
              まだ公開されているしおりがありません
            </div>
          ) : (
            <div className="space-y-3">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onOpenTrip(post.id)}
                  className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs hover:border-[#7A9D8C] transition-all cursor-pointer flex gap-3 items-center"
                >
                  {post.covers?.[0] ? (
                    <img
                      src={post.covers[0]}
                      alt={post.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-400">
                      <MapIcon size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-stone-800 truncate mb-1">
                      {post.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold mb-1">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} className="text-[#7A9D8C]" />
                        {post.destination}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart size={10} className="text-red-400" />
                        {post.likes}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#7A9D8C]">
                      しおりを開く →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscoverTab({
  publicTrips,
  currentUser,
  dashboardState,
  setDashboardState,
  onOpenTrip,
  onCopyTrip,
  onToggleLike,
  onToggleFollow,
  onOpenUserProfile,
  onEnlargeImage,
  onRefreshPublicTrips,
  onAddComment,
  scrollContainerRef,
}) {
  const searchQuery = dashboardState?.searchQuery || '';
  const discoverSort = dashboardState?.discoverSort || 'trending';
  const selectedRegion = dashboardState?.selectedRegion || 'すべて';

  const setSearchQuery = (val) =>
    setDashboardState((prev) => ({ ...prev, searchQuery: val }));
  const setDiscoverSort = (val) =>
    setDashboardState((prev) => ({ ...prev, discoverSort: val }));
  const setSelectedRegion = (val) =>
    setDashboardState((prev) => ({ ...prev, selectedRegion: val }));

  // 入力中のキーワードはローカルで保持し、「検索」ボタンを押した時だけ searchQuery に反映する
  const [searchInput, setSearchInput] = useState(searchQuery);
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const [reportingTrip, setReportingTrip] = useState(null);
  // 検索欄・エリアフィルターの開閉ステート（デフォルトは収納してスペース確保）
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isFilterActive =
    selectedRegion !== 'すべて' || searchQuery.trim() !== '';

  // プル・トゥ・リフレッシュ（X風の引っ張って更新）用のステート
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartYRef = useRef(null);
  const PULL_THRESHOLD = 70;

  const triggerRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPullDistance(54);
    setTimeout(() => {
      if (onRefreshPublicTrips) onRefreshPublicTrips();
      setIsRefreshing(false);
      setPullDistance(0);
    }, 650);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('[data-carousel-area]')) {
      pullStartYRef.current = null;
      return;
    }
    const scrollTop = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : 0;
    if (scrollTop <= 0 && !isRefreshing) {
      pullStartYRef.current = e.touches[0].clientY;
    } else {
      pullStartYRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (pullStartYRef.current === null || isRefreshing) return;
    const scrollTop = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : 0;
    if (scrollTop > 0) {
      pullStartYRef.current = null;
      setPullDistance(0);
      return;
    }
    const diff = e.touches[0].clientY - pullStartYRef.current;
    if (diff > 0) {
      const damped = Math.min(110, diff * 0.48);
      setPullDistance(damped);
    }
  };

  const handleTouchEnd = () => {
    if (pullStartYRef.current === null) return;
    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
    pullStartYRef.current = null;
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button, input, a, [data-carousel-area]')) return;
    const scrollTop = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : 0;
    if (scrollTop <= 0 && !isRefreshing) {
      pullStartYRef.current = e.clientY;
    }
  };

  const handleMouseMove = (e) => {
    if (pullStartYRef.current === null || isRefreshing) return;
    const diff = e.clientY - pullStartYRef.current;
    if (diff > 0) {
      const damped = Math.min(110, diff * 0.48);
      setPullDistance(damped);
    }
  };

  const handleMouseUp = () => {
    if (pullStartYRef.current === null) return;
    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
    pullStartYRef.current = null;
  };

  const feedItems = useMemo(() => {
    let result = [...publicTrips];

    if (discoverSort === 'following') {
      const followingIds = currentUser.following || [];
      result = result.filter((t) => {
        const authorId = t.authorId || t.members?.[0]?.id;
        return followingIds.includes(authorId);
      });
    }

    if (selectedRegion !== 'すべて') {
      result = result.filter((t) => t.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.destination || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.authorName || '').toLowerCase().includes(q)
      );
    }

    if (discoverSort === 'trending') {
      const now = Date.now();
      result.sort((a, b) => {
        const daysA = Math.max(
          0.5,
          (now - (a.publishedAt || now)) / (1000 * 60 * 60 * 24)
        );
        const scoreA = ((a.likes || 0) * 5 + (a.views || 0)) / daysA;
        const daysB = Math.max(
          0.5,
          (now - (b.publishedAt || now)) / (1000 * 60 * 60 * 24)
        );
        const scoreB = ((b.likes || 0) * 5 + (b.views || 0)) / daysB;
        return scoreB - scoreA;
      });
    } else {
      result.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
    }

    return result.map((data) => ({ type: 'trip', data }));
  }, [
    publicTrips,
    searchQuery,
    discoverSort,
    selectedRegion,
    currentUser.following,
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* ① 上部固定バー：トレンド・新着・フォロー中タブ ＋ 検索・エリア収納ボタン */}
      <div className="bg-white px-4 py-2.5 shadow-xs border-b border-stone-100 shrink-0 z-10">
        <div className="flex items-center justify-between gap-2">
          {/* トレンド等のタブ（常時そのまま表示） */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
            {[
              { id: 'trending', label: '🔥 トレンド' },
              { id: 'new', label: '✨ 新着' },
              { id: 'following', label: '👥 フォロー中' },
            ].map((tab) => {
              const isActive = discoverSort === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDiscoverSort(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                    isActive
                      ? 'bg-stone-800 text-white shadow-2xs'
                      : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 検索・エリア絞り込みの収納トグルボタン */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`relative shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${
              isFilterOpen || isFilterActive
                ? 'bg-[#7A9D8C]/15 border-[#7A9D8C] text-[#557465]'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title="検索・エリア絞り込みを開閉"
          >
            <Search
              size={14}
              className={
                isFilterOpen || isFilterActive
                  ? 'text-[#7A9D8C]'
                  : 'text-stone-500'
              }
            />
            <span>
              {selectedRegion !== 'すべて' ? selectedRegion : '検索・エリア'}
            </span>
            {isFilterActive && (
              <span className="w-2 h-2 rounded-full bg-[#7A9D8C]" />
            )}
          </button>
        </div>

        {/* 収納時に条件が設定されている場合のみ、1行でコンパクトに表示 */}
        {!isFilterOpen && isFilterActive && (
          <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <span className="text-stone-400 font-bold shrink-0">絞込中:</span>
              {selectedRegion !== 'すべて' && (
                <span className="px-2 py-0.5 bg-[#7A9D8C]/15 text-[#557465] rounded-full font-bold shrink-0">
                  🗾 {selectedRegion}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full font-bold truncate">
                  「{searchQuery}」
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion('すべて');
                setSearchInput('');
                setSearchQuery('');
              }}
              className="text-stone-400 hover:text-stone-600 font-bold underline shrink-0"
            >
              クリア
            </button>
          </div>
        )}

        {/* ボタンを押したときだけ展開する検索欄＆エリア選択ドロワー */}
        {isFilterOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-stone-100 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <form
              onSubmit={handleExecuteSearch}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="行き先・ユーザー名・キーワードを入力"
                  className="w-full py-2 pl-9 pr-8 bg-stone-100/90 rounded-xl text-xs font-bold border border-transparent focus:bg-white focus:border-[#7A9D8C] focus:outline-none transition-all"
                />
                {(searchInput || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    title="検索文字をクリア"
                  >
                    <XCircle size={15} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="shrink-0 px-4 py-2 bg-[#7A9D8C] hover:bg-[#688a79] text-white font-bold rounded-xl text-xs shadow-2xs transition-all active:scale-95 flex items-center gap-1"
              >
                <Search size={13} />
                <span>検索</span>
              </button>
            </form>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[10px] font-bold text-stone-400 shrink-0 mr-0.5 flex items-center gap-0.5">
                <MapPin size={11} className="text-[#7A9D8C]" />
                エリア:
              </span>
              {['すべて', ...REGIONS].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegion(r)}
                  className={`whitespace-nowrap px-3 py-1 text-[11px] font-bold rounded-full border transition-colors ${
                    selectedRegion === r
                      ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ② 投稿のみが独立してスクロールするフィード領域 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-y-contain no-scrollbar pb-28"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* X風のプル・トゥ・リフレッシュ（引っ張って更新）インジケーター */}
        <div
          className="overflow-hidden flex items-center justify-center transition-all duration-200 bg-[#F4F7F5]"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-stone-200/80 text-xs font-bold text-stone-600">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-[#7A9D8C]/30 border-t-[#7A9D8C] rounded-full animate-spin" />
                <span className="text-[#7A9D8C]">新しい旅を読み込み中...</span>
              </>
            ) : (
              <>
                <span
                  className="inline-block transition-transform duration-200 text-[#7A9D8C] font-extrabold"
                  style={{
                    transform:
                      pullDistance >= PULL_THRESHOLD
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                  }}
                >
                  ↓
                </span>
                <span>
                  {pullDistance >= PULL_THRESHOLD
                    ? '離して更新する'
                    : '下に引っ張って更新'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          {feedItems.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-xs font-bold flex flex-col items-center gap-2">
              <Compass size={28} className="opacity-40" />
              <span>
                {discoverSort === 'following'
                  ? 'フォロー中のユーザーの投稿がまだありません'
                  : '該当する旅行が見つかりませんでした'}
              </span>
            </div>
          ) : (
            feedItems.map((item, idx) => {
              const trip = item.data;
              const hasLiked =
                Array.isArray(trip.likedBy) &&
                trip.likedBy.includes(currentUser.id);
              const authorId =
                trip.authorId ||
                trip.members?.[0]?.id ||
                `author_${trip.authorName}`;
              const isMe = authorId === currentUser.id;
              const isFollowing =
                Array.isArray(currentUser.following) &&
                currentUser.following.includes(authorId);

              return (
                <div
                  key={trip.id || idx}
                  onClick={() => onOpenTrip(trip.id, true)}
                  className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-stone-100 cursor-pointer hover:border-stone-200 active:scale-[0.99] transition-all"
                >
                  <div className="p-4 flex justify-between items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenUserProfile &&
                          onOpenUserProfile({
                            id: authorId,
                            name: trip.authorName,
                            avatar: trip.authorAvatar || FEMALE_AVATARS[0],
                            bio:
                              trip.authorBio ||
                              `${trip.destination}などを旅しています！`,
                          });
                      }}
                      className="flex items-center gap-2.5 text-left group min-w-0 cursor-pointer"
                    >
                      <img
                        src={trip.authorAvatar || FEMALE_AVATARS[0]}
                        className="w-9 h-9 rounded-full border border-stone-100 bg-stone-50 group-hover:ring-2 group-hover:ring-[#7A9D8C] transition-all shrink-0"
                        alt="author"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-800 group-hover:text-[#7A9D8C] transition-colors truncate">
                          {trip.authorName}
                        </p>
                        <p className="text-[9px] text-stone-400">
                          {new Date(trip.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isMe && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFollow &&
                              onToggleFollow(authorId, trip.authorName);
                          }}
                          style={
                            isFollowing
                              ? {
                                  backgroundColor: '#7A9D8C',
                                  color: '#ffffff',
                                  borderColor: '#7A9D8C',
                                }
                              : {
                                  backgroundColor: '#ffffff',
                                  color: '#44403c',
                                  borderColor: '#d6d3d1',
                                }
                          }
                          className="px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                        >
                          {isFollowing ? (
                            <>
                              <Check size={12} strokeWidth={3} /> フォロー中
                            </>
                          ) : (
                            '+ フォロー'
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportingTrip(trip);
                        }}
                        className="text-stone-400 hover:text-stone-600 p-1"
                        title="投稿を報告"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  {trip.covers && trip.covers.length > 0 && (
                    <CoverPhotoCarousel
                      covers={trip.covers}
                      onEnlargeImage={onEnlargeImage}
                      onOpenTrip={() => onOpenTrip(trip.id, true)}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-base text-stone-800 leading-snug">
                        {trip.title}
                      </h3>
                    </div>
                    {trip.description && (
                      <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                        {trip.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-stone-500 mb-4">
                      <span className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg">
                        <MapPin size={11} className="text-[#7A9D8C]" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg">
                        <Calendar size={11} />
                        {trip.startDate?.replace(/-/g, '/')}
                      </span>
                      {(() => {
                        const eventSum = (trip.events || []).reduce(
                          (sum, e) => sum + (Number(e.cost) || 0),
                          0
                        );
                        const displayCost =
                          eventSum > 0 ? eventSum : trip.budget || 0;
                        return displayCost > 0 ? (
                          <span className="flex items-center gap-1 bg-[#7A9D8C]/10 text-[#557465] px-2 py-1 rounded-lg">
                            <Banknote size={11} />
                            予定合計 ¥{displayCost.toLocaleString()}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-stone-50">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike(trip.id);
                          }}
                          className="flex items-center gap-1.5 text-stone-500 hover:text-red-500 transition-colors"
                        >
                          <Heart
                            size={18}
                            className={
                              hasLiked ? 'fill-red-500 text-red-500' : ''
                            }
                          />
                          <span className="text-xs font-bold">
                            {trip.likes}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTrip(trip.id, true);
                          }}
                          className="flex items-center gap-1.5 text-stone-500 hover:text-[#7A9D8C] transition-colors"
                        >
                          <MessageCircle size={18} />
                          <span className="text-xs font-bold">
                            {(trip.comments || []).length}
                          </span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {onCopyTrip && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopyTrip(trip);
                            }}
                            className="px-3.5 py-2 bg-[#7A9D8C]/10 text-[#557465] hover:bg-[#7A9D8C]/20 text-[11px] font-bold rounded-xl transition-colors flex items-center gap-1 active:scale-95"
                          >
                            <Copy size={13} /> コピーして使う
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {reportingTrip && (
        <ReportModal
          trip={reportingTrip}
          onClose={() => setReportingTrip(null)}
          onSubmit={(reason) => {
            setReportingTrip(null);
            customAlert(
              `「${reason}」として報告を受け付けました。ご協力ありがとうございます。`
            );
          }}
        />
      )}
    </div>
  );
}

// みんなの旅カード用の横スワイプしやすいカバー写真カルーセル
function CoverPhotoCarousel({ covers, onEnlargeImage, onOpenTrip }) {
  const scrollerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    hasMoved: false,
  });

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstChild = el.querySelector('[data-cover-slide]');
    const slideWidth = firstChild
      ? firstChild.clientWidth + 12
      : el.clientWidth * 0.78;
    const idx = Math.round(el.scrollLeft / Math.max(1, slideWidth));
    setActiveIndex(Math.max(0, Math.min(covers.length - 1, idx)));
  };

  const scrollToSlide = (targetIdx) => {
    const el = scrollerRef.current;
    if (!el) return;
    const slides = el.querySelectorAll('[data-cover-slide]');
    const clamped = Math.max(0, Math.min(covers.length - 1, targetIdx));
    if (slides[clamped]) {
      el.scrollTo({
        left: slides[clamped].offsetLeft - 16,
        behavior: 'smooth',
      });
      setActiveIndex(clamped);
    }
  };

  // PCマウスドラッグ＆スマホスワイプ判定（スワイプした時は拡大や投稿遷移を発火させない）
  const handlePointerDown = (clientX, clientY) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragStateRef.current = {
      isDown: true,
      startX: clientX,
      startY: clientY,
      scrollLeft: el.scrollLeft,
      hasMoved: false,
    };
  };

  const handlePointerMove = (clientX, clientY, isMouse = false) => {
    if (!dragStateRef.current.isDown) return;
    const dx = clientX - dragStateRef.current.startX;
    const dy = clientY - dragStateRef.current.startY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      dragStateRef.current.hasMoved = true;
    }
    if (isMouse && scrollerRef.current && Math.abs(dx) > Math.abs(dy)) {
      scrollerRef.current.scrollLeft = dragStateRef.current.scrollLeft - dx;
    }
  };

  const handlePointerUp = () => {
    dragStateRef.current.isDown = false;
  };

  // 写真が1枚の時は、写真の右側の余白をタップすると投稿（しおり）が開く
  if (covers.length === 1) {
    return (
      <div
        className="px-4 pb-2 flex items-stretch cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (onOpenTrip) onOpenTrip();
        }}
      >
        <div
          className="w-[78%] sm:w-[68%] shrink-0 aspect-square rounded-2xl bg-stone-100 cursor-pointer relative group overflow-hidden shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onEnlargeImage(covers[0]);
          }}
        >
          <img
            src={covers[0]}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt="cover 1"
          />
        </div>
        {/* 右側の余白：ここをタップすると確実にしおりが開く */}
        <div
          className="flex-1 min-w-[16px] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenTrip) onOpenTrip();
          }}
        />
      </div>
    );
  }

  // 写真が2枚以上の時はスムーズに横スワイプ＆左右ボタン切り替えが可能
  return (
    <div
      data-carousel-area="true"
      className="relative pb-2"
      onClick={(e) => {
        // スワイプ直後の指離しではカードの「しおりを開く」を発火させない
        if (dragStateRef.current.hasMoved) {
          e.stopPropagation();
          dragStateRef.current.hasMoved = false;
        }
      }}
    >
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onTouchStart={(e) => {
          e.stopPropagation();
          handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY, false);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          handlePointerUp();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handlePointerDown(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          if (!dragStateRef.current.isDown) return;
          e.stopPropagation();
          handlePointerMove(e.clientX, e.clientY, true);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          handlePointerUp();
        }}
        onMouseLeave={handlePointerUp}
        style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 gap-3 scroll-smooth"
      >
        {covers.map((cover, cIdx) => (
          <div
            key={cIdx}
            data-cover-slide="true"
            className="w-[78%] sm:w-[68%] shrink-0 aspect-square snap-start rounded-2xl bg-stone-100 cursor-pointer relative group overflow-hidden shadow-md select-none"
            onClick={(e) => {
              e.stopPropagation();
              if (dragStateRef.current.hasMoved) {
                dragStateRef.current.hasMoved = false;
                return;
              }
              onEnlargeImage(cover);
            }}
          >
            <img
              src={cover}
              draggable={false}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
              alt={`cover ${cIdx + 1}`}
            />
            <div className="absolute top-3 right-3 bg-black/55 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-2xs">
              <ImageIcon size={10} /> {cIdx + 1}/{covers.length}
            </div>
          </div>
        ))}
        {/* 最後の写真もしっかり左端・中央までスワイプできるようにするための終端スペーサー */}
        <div
          className="w-[20%] shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenTrip) onOpenTrip();
          }}
        />
      </div>

      {/* 左右切り替えボタン＆インジケータードット */}
      {activeIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollToSlide(activeIndex - 1);
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center shadow-md backdrop-blur-2xs transition-all active:scale-95 z-10"
          title="前の写真"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {activeIndex < covers.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollToSlide(activeIndex + 1);
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center shadow-md backdrop-blur-2xs transition-all active:scale-95 z-10"
          title="次の写真"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div className="flex justify-center items-center gap-1.5 mt-2">
        {covers.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollToSlide(idx);
            }}
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === idx ? 'w-4 bg-[#7A9D8C]' : 'w-1.5 bg-stone-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// 投稿の報告モーダル
function ReportModal({ trip, onClose, onSubmit }) {
  const REPORT_REASONS = [
    'スパム・宣伝目的の投稿',
    '不適切なコンテンツ・公序良俗に反する内容',
    '虚偽の情報・誤解を招く内容',
    '著作権・プライバシーの侵害',
    'その他',
  ];
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[260] flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 pb-safe max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-base text-stone-800 flex items-center gap-2">
            <Flag size={18} className="text-red-500" /> 投稿を報告する
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 mb-4">
            <p className="text-[10px] font-bold text-stone-400 mb-0.5">
              対象の投稿
            </p>
            <p className="text-xs font-bold text-stone-700 truncate">
              {trip.title}（{trip.authorName}）
            </p>
          </div>

          <label className="block text-xs font-bold text-stone-500 mb-2 pl-1">
            報告する理由を選択してください
          </label>
          <div className="space-y-2 mb-4">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                  selectedReason === reason
                    ? 'border-red-400 bg-red-50/70 text-red-700 shadow-2xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{reason}</span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedReason === reason
                      ? 'border-red-500'
                      : 'border-stone-300'
                  }`}
                >
                  {selectedReason === reason && (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1.5 pl-1">
              詳細（任意）
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows="2"
              placeholder="具体的な状況などがあればご記入ください..."
              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-2xl text-xs hover:bg-stone-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => onSubmit(selectedReason, detail)}
            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl text-xs shadow-sm hover:bg-red-600 transition-colors"
          >
            報告を送信する
          </button>
        </div>
      </div>
    </div>
  );
}
function TripDetail({
  currentUser,
  trip,
  isReadOnly,
  myTrips,
  updateTrip,
  onDeleteTrip,
  onToggleAutoMinimize,
  onPublish,
  onBack,
  onEnlargeImage,
  onCopySave,
  onOpenAuthUpgrade,
  onAddComment,
}) {
  const [activeTab, setActiveTab] = useState('shiori');
  const [selectedDate, setSelectedDate] = useState(trip.startDate);
  const [shioriSubTab, setShioriSubTab] = useState('date'); // 'date' | 'packing' | 'budget'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [copyTarget, setCopyTarget] = useState(null);

  // スワイプで戻るジェスチャー用のステート・Ref（タッチ＆マウスドラッグ両対応）
  const swipeStartRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleSwipeStart = (clientX, clientY, target) => {
    if (target && target.closest('input, textarea, select, [data-no-swipe]'))
      return;
    swipeStartRef.current = { x: clientX, y: clientY, isEdge: clientX <= 48 };
  };

  const handleSwipeMove = (clientX, clientY) => {
    if (!swipeStartRef.current) return;
    const dx = clientX - swipeStartRef.current.x;
    const dy = Math.abs(clientY - swipeStartRef.current.y);
    if (dy > 55 && dy > dx) {
      swipeStartRef.current = null;
      setSwipeOffset(0);
      return;
    }
    if (dx > 15 && (swipeStartRef.current.isEdge || dx > 35) && dy < 45) {
      setSwipeOffset(Math.min(120, dx * 0.65));
    }
  };

  const handleSwipeEnd = (clientX, clientY) => {
    if (!swipeStartRef.current) return;
    const dx = clientX - swipeStartRef.current.x;
    const dy = Math.abs(clientY - swipeStartRef.current.y);
    const shouldGoBack =
      (swipeStartRef.current.isEdge && dx > 55 && dy < 60) ||
      (dx > 95 && dy < 45);
    swipeStartRef.current = null;
    setSwipeOffset(0);
    if (shouldGoBack) {
      onBack();
    }
  };

  // 旅の基本情報（タイトル・行き先・日付）編集用ステート
  const [editTitle, setEditTitle] = useState(trip.title || '');
  const [editDestination, setEditDestination] = useState(
    trip.destination || ''
  );
  const [editStartDate, setEditStartDate] = useState(
    trip.startDate || getTodayString()
  );
  const [editEndDate, setEditEndDate] = useState(
    trip.endDate || trip.startDate || getTodayString()
  );

  useEffect(() => {
    setEditTitle(trip.title || '');
    setEditDestination(trip.destination || '');
    setEditStartDate(trip.startDate || getTodayString());
    setEditEndDate(trip.endDate || trip.startDate || getTodayString());
  }, [trip.id, trip.title, trip.destination, trip.startDate, trip.endDate]);

  // コピー直後などで別のしおりに切り替わった際、選択中の日付やタブを新しいしおりの初日に同期する
  useEffect(() => {
    setSelectedDate(trip.startDate || getTodayString());
    setActiveTab('shiori');
    setShioriSubTab('date');
    setIsSettingsOpen(false);
  }, [trip.id]);

  const handleSaveTripInfo = () => {
    if (!editTitle.trim()) {
      customAlert('旅のタイトルを入力してください');
      return;
    }
    const validEnd = editEndDate >= editStartDate ? editEndDate : editStartDate;

    // 出発日が変更された場合、既存の予定の日付も新しい日程に合わせてスライド調整する
    const oldStart = new Date(trip.startDate);
    const newStart = new Date(editStartDate);
    const newEnd = new Date(validEnd);
    const dayShift = Math.round((newStart - oldStart) / (1000 * 60 * 60 * 24));

    const updatedEvents = (trip.events || []).map((ev) => {
      if (!ev.date) return { ...ev, date: editStartDate };
      const evDt = new Date(ev.date);
      evDt.setDate(evDt.getDate() + dayShift);
      if (evDt < newStart) return { ...ev, date: editStartDate };
      if (evDt > newEnd) return { ...ev, date: validEnd };
      return { ...ev, date: evDt.toISOString().split('T')[0] };
    });

    updateTrip({
      ...trip,
      title: editTitle.trim(),
      destination: editDestination.trim() || '未設定',
      startDate: editStartDate,
      endDate: validEnd,
      events: updatedEvents,
    });
    setSelectedDate(editStartDate);
    setEditEndDate(validEnd);
    customAlert('旅の基本情報（名前・行き先・日程）を更新しました！');
  };

  const generateDateArray = (start, end) => {
    const arr = [];
    let dt = new Date(start);
    const endDt = new Date(end);
    while (dt <= endDt) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };
  const tripDates = generateDateArray(trip.startDate, trip.endDate);

  // 持ち物カウント（各自の持ち物はログイン中のユーザー自身の分＋みんなの共用分のみを集計）
  const rawPackingItems = Array.isArray(trip.packingList)
    ? trip.packingList
    : [];
  const myVisiblePackingItems = rawPackingItems.filter(
    (item) =>
      item.category === 'shared' ||
      !item.ownerId ||
      item.ownerId === currentUser?.id
  );
  const isPackingItemCheckedByMe = (item) => {
    if (item.category === 'shared') return Boolean(item.checked);
    if (item.checkedBy && typeof item.checkedBy === 'object') {
      return Boolean(item.checkedBy[currentUser?.id]);
    }
    return Boolean(item.checked);
  };
  const checkedPackingCount = myVisiblePackingItems.filter(
    isPackingItemCheckedByMe
  ).length;

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F7F5] animate-in slide-in-from-right-8 duration-300 relative"
      style={
        swipeOffset > 0
          ? { transform: `translateX(${swipeOffset}px)`, transition: 'none' }
          : { transition: 'transform 0.2s ease-out' }
      }
      onTouchStart={(e) =>
        handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY, e.target)
      }
      onTouchMove={(e) =>
        handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchEnd={(e) =>
        handleSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      }
      onMouseDown={(e) => handleSwipeStart(e.clientX, e.clientY, e.target)}
      onMouseMove={(e) => {
        if (e.buttons === 1) handleSwipeMove(e.clientX, e.clientY);
      }}
      onMouseUp={(e) => handleSwipeEnd(e.clientX, e.clientY)}
    >
      {swipeOffset > 20 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-stone-800/80 text-white px-2.5 py-2 rounded-full shadow-lg flex items-center gap-1 text-[10px] font-bold pointer-events-none">
          <ChevronLeft size={14} /> 戻る
        </div>
      )}

      {/* ① 上部固定エリア（タイトル・日程タブ・持ち物/予算ボタン） */}
      <div className="bg-white pt-12 pb-3 px-5 shadow-sm z-20 shrink-0 border-b border-stone-100 relative">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-bold text-base text-stone-800 truncate flex-1 text-center px-2">
            {trip.title}
          </h2>
          <div className="flex items-center gap-1">
            {isReadOnly ? (
              <button
                onClick={() => setCopyTarget({ type: 'trip', data: trip })}
                className="px-3 py-1.5 bg-[#7A9D8C] text-white hover:bg-[#688a79] rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs active:scale-95"
                title="このしおりをコピーして使う"
              >
                <Copy size={13} /> コピー
              </button>
            ) : (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"
              >
                <MoreVertical size={20} />
              </button>
            )}
          </div>
        </div>

        {activeTab === 'shiori' && (
          <div className="flex items-end justify-between gap-2 pb-0.5">
            {/* 左側：日程（日付）タブ（日数が多い場合はここだけ横スクロール） */}
            <div
              data-no-swipe="true"
              className="flex items-end gap-1.5 overflow-x-auto no-scrollbar"
            >
              {tripDates.map((date) => {
                const isSelected =
                  shioriSubTab === 'date' && date === selectedDate;
                const dateObj = new Date(date);
                const isToday = date === getTodayString();
                return (
                  <button
                    key={date}
                    onClick={() => {
                      setShioriSubTab('date');
                      setSelectedDate(date);
                    }}
                    className={`py-1.5 px-2.5 whitespace-nowrap border-b-2 flex flex-col items-center min-w-[52px] rounded-t-xl transition-all ${
                      isSelected
                        ? 'border-[#7A9D8C] bg-[#7A9D8C]/10'
                        : 'border-transparent text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {isToday && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full mb-0.5 font-bold ${
                          isSelected
                            ? 'bg-[#7A9D8C] text-white'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        今日
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#7A9D8C]' : 'text-stone-600'
                      }`}
                    >{`${dateObj.getMonth() + 1}/${dateObj.getDate()}`}</span>
                  </button>
                );
              })}
            </div>

            {/* 右側：右端に固定配置される「持ち物」「予算」タブ */}
            <div className="flex items-end gap-1 shrink-0 ml-auto pl-2 border-l border-stone-200/80">
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setShioriSubTab('packing')}
                  className={`py-1.5 px-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 rounded-t-xl transition-all ${
                    shioriSubTab === 'packing'
                      ? 'border-[#7A9D8C] bg-[#7A9D8C]/10 text-[#557465]'
                      : 'border-transparent text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <CheckCircle2
                    size={13}
                    className={
                      shioriSubTab === 'packing'
                        ? 'text-[#7A9D8C]'
                        : 'text-stone-400'
                    }
                  />
                  <span className="text-xs font-bold">持ち物</span>
                  {myVisiblePackingItems.length > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        shioriSubTab === 'packing'
                          ? 'bg-[#7A9D8C] text-white'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {checkedPackingCount}/{myVisiblePackingItems.length}
                    </span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShioriSubTab('budget')}
                className={`py-1.5 px-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 rounded-t-xl transition-all ${
                  shioriSubTab === 'budget'
                    ? 'border-[#7A9D8C] bg-[#7A9D8C]/10 text-[#557465]'
                    : 'border-transparent text-stone-500 hover:bg-stone-50'
                }`}
              >
                <Banknote
                  size={14}
                  className={
                    shioriSubTab === 'budget'
                      ? 'text-[#7A9D8C]'
                      : 'text-stone-400'
                  }
                />
                <span className="text-xs font-bold">予算</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ② 中央スクロールエリア（予定タイムライン・持ち物・予算・思い出写真の中身のみ動く） */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain z-10 relative scroll-smooth no-scrollbar">
        {activeTab === 'shiori' ? (
          shioriSubTab === 'packing' && !isReadOnly ? (
            <PackingListView
              trip={trip}
              updateTrip={updateTrip}
              currentUser={currentUser}
              isReadOnly={isReadOnly}
            />
          ) : shioriSubTab === 'budget' ? (
            <BudgetView
              trip={trip}
              updateTrip={updateTrip}
              currentUser={currentUser}
              isReadOnly={isReadOnly}
            />
          ) : (
            <Timeline
              trip={trip}
              updateTrip={updateTrip}
              selectedDate={selectedDate}
              currentUser={currentUser}
              isReadOnly={isReadOnly}
              onCopyEvent={(e) => setCopyTarget({ type: 'event', data: e })}
              onCopyDay={(dayEvents) =>
                setCopyTarget({ type: 'day', data: dayEvents })
              }
              onEnlargeImage={onEnlargeImage}
            />
          )
        ) : activeTab === 'comments' ? (
          <CommentView
            trip={trip}
            currentUser={currentUser}
            onAddComment={onAddComment}
          />
        ) : (
          <AlbumView
            trip={trip}
            currentUser={currentUser}
            updateTrip={updateTrip}
            isReadOnly={isReadOnly}
            onEnlargeImage={onEnlargeImage}
          />
        )}
      </main>

      {/* ③ 下部固定エリア（「しおり」「思い出写真」バー） */}
      <nav className="bg-white/95 backdrop-blur-md border-t border-stone-200/60 flex justify-around pb-safe z-40 relative shrink-0">
        <button
          onClick={() => setActiveTab('shiori')}
          className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-1 transition-colors ${
            activeTab === 'shiori' ? 'text-[#7A9D8C]' : 'text-stone-400'
          }`}
        >
          <div
            className={`p-1 rounded-xl ${
              activeTab === 'shiori' ? 'bg-[#7A9D8C]/10' : ''
            }`}
          >
            <MapIcon size={20} strokeWidth={activeTab === 'shiori' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold">しおり</span>
        </button>
        {!isReadOnly && (
          <button
            onClick={() => setActiveTab('album')}
            className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-1 transition-colors ${
              activeTab === 'album' ? 'text-[#7A9D8C]' : 'text-stone-400'
            }`}
          >
            <div
              className={`p-1 rounded-xl ${
                activeTab === 'album' ? 'bg-[#7A9D8C]/10' : ''
              }`}
            >
              <ImageIcon
                size={20}
                strokeWidth={activeTab === 'album' ? 2.5 : 2}
              />
            </div>
            <span className="text-[10px] font-bold">思い出写真</span>
          </button>
        )}
        {isReadOnly && (
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-1 transition-colors ${
              activeTab === 'comments' ? 'text-[#7A9D8C]' : 'text-stone-400'
            }`}
          >
            <div
              className={`p-1 rounded-xl ${
                activeTab === 'comments' ? 'bg-[#7A9D8C]/10' : ''
              }`}
            >
              <MessageSquare
                size={20}
                strokeWidth={activeTab === 'comments' ? 2.5 : 2}
              />
            </div>
            <span className="text-[10px] font-bold">
              コメント ({(trip.comments || []).length})
            </span>
          </button>
        )}
      </nav>

      {isSettingsOpen && !isReadOnly && (
        <div
          className="fixed inset-0 bg-black/45 z-[150] flex justify-end animate-in fade-in"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right-full pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base flex items-center gap-2 text-stone-800">
                <Info size={18} className="text-[#7A9D8C]" /> 旅の管理・設定
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* 旅の基本情報（タイトル・行き先・日程）編集セクション */}
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-stone-700 flex items-center gap-1.5">
                <Edit2 size={14} className="text-[#7A9D8C]" />{' '}
                旅の基本情報を変更
              </h4>
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">
                  旅行の名前（タイトル）
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="例: 秋の京都・グルメ旅"
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">
                  行き先（都道府県・エリア）
                </label>
                <input
                  type="text"
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                  placeholder="例: 神奈川県・箱根"
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-1">
                    出発日
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setEditStartDate(nextStart);
                      if (editEndDate < nextStart) setEditEndDate(nextStart);
                    }}
                    className="w-full p-2 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-1">
                    最終日
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    min={editStartDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveTripInfo}
                className="w-full py-2.5 bg-[#7A9D8C] text-white font-bold rounded-xl shadow-2xs hover:bg-[#688a79] transition-colors text-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check size={14} /> 基本情報の変更を保存
              </button>
            </div>

            <div
              className={`mb-6 p-4 border rounded-2xl ${
                currentUser.isGuest
                  ? 'bg-stone-100 border-stone-200'
                  : 'bg-[#7A9D8C]/10 border-[#7A9D8C]/20'
              }`}
            >
              <h4
                className={`font-bold text-xs mb-1.5 flex items-center gap-1.5 ${
                  currentUser.isGuest ? 'text-stone-500' : 'text-[#7A9D8C]'
                }`}
              >
                <Globe size={15} /> みんなの旅に公開する
              </h4>
              <p className="text-[10px] text-stone-500 mb-2.5 leading-relaxed">
                ※各予定に貼った写真のうち「公開OK」にした写真や、メモの公開有無を確認画面で選んで投稿できます。
              </p>
              <button
                onClick={() => {
                  if (currentUser.isGuest) {
                    customAlert('アカウント登録後にご利用いただけます。');
                    return;
                  }
                  setIsSettingsOpen(false);
                  setShowPublishModal(true);
                }}
                className={`w-full py-2.5 font-bold rounded-xl shadow-sm transition-colors text-xs flex justify-center items-center gap-1.5 ${
                  currentUser.isGuest
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#7A9D8C] text-white hover:bg-[#688a79]'
                }`}
              >
                {currentUser.isGuest ? (
                  'ゲストは公開できません'
                ) : (
                  <>
                    <Share2 size={14} /> 公開設定・確認へ進む
                  </>
                )}
              </button>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] text-stone-400 font-bold">
                  参加メンバー ({(trip.members || []).length}人)
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(trip.members || []).map((m, i) => (
                  <div
                    key={m.id || i}
                    className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 py-1 px-2.5 rounded-full"
                  >
                    <UserAvatar user={m} size="w-5 h-5" />
                    <span className="text-xs font-bold text-stone-700">
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between gap-2 bg-white py-1.5 px-3 rounded-xl border border-stone-200/80">
                  <span className="text-xs font-mono font-extrabold tracking-wider text-stone-700 select-all">
                    {trip.id}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        trip.id,
                        `招待コード「${trip.id}」をコピーしました！`
                      )
                    }
                    className="px-2.5 py-1 bg-[#7A9D8C]/15 hover:bg-[#7A9D8C]/25 text-[#557465] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Copy size={12} /> コードのみコピー
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `「${trip.title}」の旅行計画を一緒に作ろう！✈️\n\n▼ 招待コード\n${trip.id}\n\n▼ アプリをまだ持っていない方はこちら（インストールURL）\nhttps://tabitabi.app/dl`,
                      'アプリ紹介URL付きの招待文をコピーしました！'
                    )
                  }
                  className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-[#557465] border border-[#7A9D8C]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Share2 size={13} /> アプリ紹介リンク付きで招待文をコピー
                </button>
              </div>
            </div>
            {(trip.members || []).length === 1 && !trip.isSoloTrip && (
              <div className="mb-4">
                <button
                  onClick={() => updateTrip({ ...trip, isSoloTrip: true })}
                  className="w-full py-3 bg-stone-100 text-stone-600 font-bold rounded-xl text-xs flex justify-center items-center gap-2 hover:bg-stone-200 transition-colors"
                >
                  👤 ひとり旅行として確定する（承認省略）
                </button>
              </div>
            )}
            {trip.isSoloTrip && (
              <div className="p-3 bg-stone-100 rounded-xl text-center border border-stone-200 mb-6">
                <p className="text-xs font-bold text-stone-600">
                  👤 ひとり旅行モード中
                </p>
              </div>
            )}

            <div className="pt-5 mt-5 border-t border-stone-200/80">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setShowDeleteConfirmModal(true);
                }}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Trash2 size={15} /> このしおりを削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[260] flex justify-center items-center p-4 animate-in fade-in"
          onClick={() => setShowDeleteConfirmModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">
              しおりを削除しますか？
            </h3>
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 mb-3">
              <p className="text-xs font-bold text-stone-800 truncate">
                {trip.title}
              </p>
              <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                {trip.destination || '未設定'} / {(trip.events || []).length}
                件の予定
              </p>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              削除したしおりや予定・思い出アルバムのデータは元に戻せません。本当によろしいですか？
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  if (onDeleteTrip) onDeleteTrip(trip.id);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} /> 削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublishModal && (
        <PublishModal
          trip={trip}
          currentUser={currentUser}
          onClose={() => setShowPublishModal(false)}
          onPublish={(p) => {
            onPublish(p);
            setShowPublishModal(false);
            customAlert('「みんなの旅」に公開しました！');
          }}
        />
      )}
      {copyTarget && (
        <CopyModal
          type={copyTarget.type}
          sourceData={copyTarget.data}
          currentUser={currentUser}
          myTrips={myTrips}
          onClose={() => setCopyTarget(null)}
          onOpenRegister={() => {
            setCopyTarget(null);
            if (onOpenAuthUpgrade) onOpenAuthUpgrade();
          }}
          onComplete={(newTrip, updatedTrip) => {
            onCopySave(newTrip, updatedTrip);
            setCopyTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ------------------------------------------
// 持ち物リスト画面 (PackingListView)
// ------------------------------------------
function PackingListView({ trip, updateTrip, currentUser, isReadOnly }) {
  const [newItemText, setNewItemText] = useState('');
  const [category, setCategory] = useState('personal'); // 'personal' | 'shared'
  const [assigneeId, setAssigneeId] = useState(currentUser?.id || '');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'personal' | 'shared'

  // 担当者選択モーダル用のステート（新規追加時 または 既存アイテムの担当者変更時）
  const [assigneeModalState, setAssigneeModalState] = useState(null);
  // { mode: 'add', title: string } | { mode: 'edit', item: object } | { mode: 'preset' }

  const DEFAULT_PACKING_PRESETS = [
    { title: 'スマートフォン・充電器', category: 'personal' },
    { title: 'モバイルバッテリー', category: 'personal' },
    { title: '財布・現金・クレジットカード', category: 'personal' },
    { title: '着替え・下着・靴下', category: 'personal' },
    { title: '常備薬・絆創膏', category: 'personal' },
    { title: '歯ブラシ・スキンケア用品', category: 'personal' },
    { title: '折りたたみ傘・雨具', category: 'personal' },
    { title: 'エコバッグ・ビニール袋', category: 'shared' },
    { title: 'ウェットティッシュ・除菌シート', category: 'shared' },
  ];

  const packingList = Array.isArray(trip.packingList) ? trip.packingList : [];
  const tripMembers =
    Array.isArray(trip.members) && trip.members.length > 0
      ? trip.members
      : [currentUser];

  // 「各自の持ち物」は自分（currentUser.id）の持ち物として独立管理し、チェック状態もユーザーごとに独立させる
  const isItemVisibleForMe = (item) => {
    if (item.category === 'shared') return true;
    return !item.ownerId || item.ownerId === currentUser?.id;
  };

  const isItemCheckedForMe = (item) => {
    if (item.category === 'shared') return Boolean(item.checked);
    if (item.checkedBy && typeof item.checkedBy === 'object') {
      return Boolean(item.checkedBy[currentUser?.id]);
    }
    return Boolean(item.checked);
  };

  const myVisiblePackingList = packingList.filter(isItemVisibleForMe);

  const resolveAssigneeInfo = (selectedId) => {
    if (selectedId === 'unassigned') {
      return { id: 'unassigned', name: '未定（みんなで相談）' };
    }
    const found = tripMembers.find((m) => m.id === selectedId) || currentUser;
    return {
      id: found?.id || currentUser.id,
      name: found?.name || currentUser.name,
    };
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim() || isReadOnly) return;

    // 「みんなの共用」が選ばれている場合は、追加ボタンを押した時に担当者選択画面を表示する
    if (!trip.isSoloTrip && category === 'shared') {
      setAssigneeModalState({
        mode: 'add',
        title: newItemText.trim(),
        selectedMemberId: assigneeId || currentUser?.id || 'unassigned',
      });
      return;
    }

    // 「各自の持ち物」は追加した本人（currentUser.id）専用の独立したアイテムとして保存する
    const newItem = {
      id: generateId(),
      title: newItemText.trim(),
      category: 'personal',
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      checked: false,
      checkedBy: { [currentUser.id]: false },
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
    };
    updateTrip({ ...trip, packingList: [...packingList, newItem] });
    setNewItemText('');
  };

  const handleConfirmAssigneeModal = (chosenMemberId) => {
    if (!assigneeModalState) return;
    const assigned = resolveAssigneeInfo(chosenMemberId);
    setAssigneeId(chosenMemberId);

    if (assigneeModalState.mode === 'add') {
      const newItem = {
        id: generateId(),
        title: assigneeModalState.title,
        category: 'shared',
        checked: false,
        assigneeId: assigned.id,
        assigneeName: assigned.name,
      };
      updateTrip({ ...trip, packingList: [...packingList, newItem] });
      setNewItemText('');
      customAlert(
        `「${newItem.title}」を ${assigned.name} さんの担当で追加しました！`
      );
    } else if (assigneeModalState.mode === 'edit' && assigneeModalState.item) {
      const targetId = assigneeModalState.item.id;
      updateTrip({
        ...trip,
        packingList: packingList.map((item) =>
          item.id === targetId
            ? { ...item, assigneeId: assigned.id, assigneeName: assigned.name }
            : item
        ),
      });
      customAlert(
        `「${assigneeModalState.item.title}」の担当を ${assigned.name} に変更しました！`
      );
    }

    setAssigneeModalState(null);
  };

  const handleAddPresets = () => {
    if (isReadOnly) return;
    const myPersonalTitles = new Set(
      myVisiblePackingList
        .filter((i) => i.category === 'personal')
        .map((i) => i.title)
    );
    const sharedTitles = new Set(
      packingList.filter((i) => i.category === 'shared').map((i) => i.title)
    );

    const additions = DEFAULT_PACKING_PRESETS.filter((p) => {
      const cat = trip.isSoloTrip ? 'personal' : p.category;
      return cat === 'shared'
        ? !sharedTitles.has(p.title)
        : !myPersonalTitles.has(p.title);
    }).map((p) => {
      const cat = trip.isSoloTrip ? 'personal' : p.category;
      return {
        id: generateId(),
        title: p.title,
        category: cat,
        ownerId: cat === 'personal' ? currentUser.id : null,
        ownerName: cat === 'personal' ? currentUser.name : null,
        checked: false,
        checkedBy: { [currentUser.id]: false },
        assigneeId: currentUser.id,
        assigneeName: currentUser.name,
      };
    });
    if (additions.length === 0) {
      customAlert('定番の持ち物はすでにあなたのリストに入っています！');
      return;
    }
    updateTrip({ ...trip, packingList: [...packingList, ...additions] });
    customAlert(`定番の持ち物（${additions.length}件）を追加しました！`);
  };

  const handleToggleItem = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      packingList: packingList.map((item) => {
        if (item.id !== id) return item;
        if (item.category === 'shared') {
          return { ...item, checked: !item.checked };
        }
        const currentChecked = isItemCheckedForMe(item);
        return {
          ...item,
          checked: !currentChecked,
          checkedBy: {
            ...(item.checkedBy || {}),
            [currentUser.id]: !currentChecked,
          },
        };
      }),
    });
  };

  const handleDeleteItem = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      packingList: packingList.filter((item) => item.id !== id),
    });
  };

  const filteredItems = myVisiblePackingList.filter((item) => {
    if (filterTab === 'all') return true;
    return item.category === filterTab;
  });

  const checkedCount = myVisiblePackingList.filter(isItemCheckedForMe).length;
  const progressPercent =
    myVisiblePackingList.length > 0
      ? Math.round((checkedCount / myVisiblePackingList.length) * 100)
      : 0;

  return (
    <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
      {/* 準備進捗カード */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-bold text-sm text-stone-800 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#7A9D8C]" />{' '}
              持ち物チェックリスト
            </h3>
            <p className="text-[11px] text-stone-400 font-bold mt-0.5">
              {trip.isSoloTrip
                ? '忘れ物がないようにチェックしましょう'
                : '👤 各自の持ち物はあなた専用（他メンバーと独立）で管理されます'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-[#7A9D8C]">
              {progressPercent}%
            </span>
            <p className="text-[10px] font-bold text-stone-400">
              {checkedCount}/{myVisiblePackingList.length} 完了
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7A9D8C] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {!isReadOnly && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddPresets}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Sparkles size={12} className="text-amber-500" />{' '}
              定番セットを一括追加
            </button>
            {checkedCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  updateTrip({
                    ...trip,
                    packingList: packingList.map((item) => {
                      if (!isItemVisibleForMe(item)) return item;
                      if (item.category === 'shared')
                        return { ...item, checked: false };
                      return {
                        ...item,
                        checked: false,
                        checkedBy: {
                          ...(item.checkedBy || {}),
                          [currentUser.id]: false,
                        },
                      };
                    }),
                  })
                }
                className="text-[11px] font-bold text-stone-400 hover:text-stone-600 underline"
              >
                チェックをすべて外す
              </button>
            )}
          </div>
        )}
      </div>

      {/* 新規持ち物追加フォーム */}
      {!isReadOnly && (
        <form
          onSubmit={handleAddItem}
          className="bg-white p-4 rounded-2xl shadow-xs border border-stone-100 space-y-2.5"
        >
          {!trip.isSoloTrip && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex bg-stone-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCategory('personal')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    category === 'personal'
                      ? 'bg-white text-stone-800 shadow-2xs'
                      : 'text-stone-500'
                  }`}
                >
                  👤 各自の持ち物
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('shared')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    category === 'shared'
                      ? 'bg-white text-stone-800 shadow-2xs'
                      : 'text-stone-500'
                  }`}
                >
                  👥 みんなの共用
                </button>
              </div>

              {category === 'shared' ? (
                <span className="text-[10px] font-bold text-[#557465] bg-[#7A9D8C]/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <User size={11} className="text-[#7A9D8C]" />
                  全員で共有（追加時に担当を選択）
                </span>
              ) : (
                <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  🔒 {currentUser?.name}さん専用の持ち物に追加
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="持ち物を追加（例：モバイルバッテリー、御朱印帳）"
              className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
            />
            <button
              type="submit"
              disabled={!newItemText.trim()}
              className="px-4 py-2.5 bg-[#7A9D8C] text-white font-bold rounded-xl text-xs shadow-xs hover:bg-[#688a79] disabled:opacity-40 transition-all shrink-0 flex items-center gap-1"
            >
              <Plus size={15} /> 追加
            </button>
          </div>
        </form>
      )}

      {/* フィルタータブ（複数人旅のとき） */}
      {!trip.isSoloTrip && myVisiblePackingList.length > 0 && (
        <div className="flex gap-1.5">
          {[
            { id: 'all', label: `すべて (${myVisiblePackingList.length})` },
            {
              id: 'personal',
              label: `👤 自分専用 (${
                myVisiblePackingList.filter((i) => i.category === 'personal')
                  .length
              })`,
            },
            {
              id: 'shared',
              label: `👥 みんなの共用 (${
                myVisiblePackingList.filter((i) => i.category === 'shared')
                  .length
              })`,
            },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                filterTab === t.id
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* リスト一覧 */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-200">
          <CheckCircle2 size={30} className="text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-stone-500 mb-1">
            まだ持ち物が登録されていません
          </p>
          <p className="text-[11px] text-stone-400">
            上の「定番セットを一括追加」または入力欄から追加できます
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const isChecked = isItemCheckedForMe(item);
            return (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-stone-50/80 border-stone-200/70 text-stone-400'
                    : 'bg-white border-stone-100 shadow-2xs hover:border-[#7A9D8C]/50 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-[#7A9D8C] border-[#7A9D8C] text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={13} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold truncate ${
                        isChecked
                          ? 'line-through text-stone-400'
                          : 'text-stone-800'
                      }`}
                    >
                      {item.title}
                    </p>
                    {!trip.isSoloTrip && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {item.category === 'shared' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isReadOnly) {
                                setAssigneeModalState({
                                  mode: 'edit',
                                  item,
                                  selectedMemberId:
                                    item.assigneeId ||
                                    currentUser?.id ||
                                    'unassigned',
                                });
                              }
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/70 inline-flex items-center gap-1 transition-colors active:scale-95"
                            title="タップして担当者を変更"
                          >
                            <span>
                              👥 共用（担当: {item.assigneeName || '未定'}）
                            </span>
                            {!isReadOnly && (
                              <Edit2 size={10} className="opacity-70" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 inline-flex items-center gap-1">
                            👤 自分専用（{currentUser?.name}）
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="p-1.5 text-stone-300 hover:text-red-500 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
                    title="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 担当メンバー選択モーダル（共用アイテム追加時＆変更時） */}
      {assigneeModalState && (
        <div
          className="fixed inset-0 bg-black/60 z-[260] flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in"
          onClick={() => setAssigneeModalState(null)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-stone-800 flex items-center gap-2">
                <User size={18} className="text-[#7A9D8C]" />
                誰が担当しますか？
              </h3>
              <button
                type="button"
                onClick={() => setAssigneeModalState(null)}
                className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 mb-4">
              <p className="text-[10px] font-bold text-stone-400 mb-0.5">
                対象の共用アイテム
              </p>
              <p className="text-xs font-extrabold text-stone-800 truncate">
                👥{' '}
                {assigneeModalState.mode === 'add'
                  ? assigneeModalState.title
                  : assigneeModalState.item?.title}
              </p>
            </div>

            <p className="text-[11px] font-bold text-stone-500 mb-2.5 pl-1">
              参加しているメンバーから担当者を選んでください
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar mb-4">
              {tripMembers.map((member, idx) => {
                const isSelected =
                  assigneeModalState.selectedMemberId === member.id;
                const isMe = member.id === currentUser?.id;
                return (
                  <button
                    key={member.id || idx}
                    type="button"
                    onClick={() => handleConfirmAssigneeModal(member.id)}
                    className={`w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#7A9D8C] bg-[#7A9D8C]/10 shadow-2xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={member} size="w-9 h-9" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-stone-800 truncate">
                            {member.name}
                          </span>
                          {isMe && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7A9D8C]/15 text-[#557465] shrink-0">
                              あなた
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 font-bold">
                          タップしてこのメンバーを担当にする
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}

              {/* 担当をまだ決めない（未定）選択肢 */}
              <button
                type="button"
                onClick={() => handleConfirmAssigneeModal('unassigned')}
                className={`w-full p-3 rounded-2xl border-2 border-dashed text-left flex items-center justify-between gap-3 transition-all active:scale-[0.99] ${
                  assigneeModalState.selectedMemberId === 'unassigned'
                    ? 'border-[#7A9D8C] bg-[#7A9D8C]/10'
                    : 'border-stone-300 bg-stone-50/70 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0">
                    ？
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-stone-700">
                      未定（あとでみんなで決める）
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold">
                      担当者を指定せずにリストへ追加します
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-stone-400 shrink-0" />
              </button>
            </div>

            {tripMembers.length <= 1 && (
              <p className="text-[10px] text-stone-400 text-center mb-3 leading-relaxed">
                ※招待コードで友達が参加すると、ここにメンバーが並んで選べるようになります。
              </p>
            )}

            <button
              type="button"
              onClick={() => setAssigneeModalState(null)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-xs transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------
// 予算・出費管理画面 (BudgetView)
// ------------------------------------------
function BudgetView({ trip, updateTrip, currentUser, isReadOnly }) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(String(trip.budget || 50000));
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('meal');

  // おみやげ追加用ステート
  const [souvenirTarget, setSouvenirTarget] = useState('自分用');
  const [souvenirTitle, setSouvenirTitle] = useState('');
  const [souvenirAmount, setSouvenirAmount] = useState('');

  const SOUVENIR_TARGETS = [
    '自分用',
    '家族・実家',
    '職場・学校',
    '友達',
    'その他',
  ];
  const QUICK_SOUVENIR_PRESETS = [
    {
      label: '＋ 職場・ばらまき用 (¥3,000)',
      target: '職場・学校',
      title: '職場・ばらまき用お菓子',
      amount: 3000,
    },
    {
      label: '＋ 家族・実家用 (¥3,000)',
      target: '家族・実家',
      title: '家族・実家用おみやげ',
      amount: 3000,
    },
    {
      label: '＋ 友達用 (¥2,000)',
      target: '友達',
      title: '友達用おみやげ',
      amount: 2000,
    },
    {
      label: '＋ 自分へのご褒美 (¥3,000)',
      target: '自分用',
      title: '自分用ご当地グルメ・雑貨',
      amount: 3000,
    },
  ];

  const events = Array.isArray(trip.events) ? trip.events : [];
  const extraExpenses = Array.isArray(trip.extraExpenses)
    ? trip.extraExpenses
    : [];
  const souvenirList = Array.isArray(trip.souvenirList)
    ? trip.souvenirList
    : [];

  // タイムラインの予定から自動計算
  const approvedEventCost = events
    .filter((e) => e.status !== 'proposed')
    .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  const proposedEventCost = events
    .filter((e) => e.status === 'proposed')
    .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  const eventsOnlyTotal = approvedEventCost + proposedEventCost;
  const souvenirCostTotal = isReadOnly
    ? 0
    : souvenirList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const extraCostTotal = isReadOnly
    ? 0
    : extraExpenses.reduce((sum, ex) => sum + (Number(ex.amount) || 0), 0);

  const totalEstimated = isReadOnly
    ? eventsOnlyTotal
    : eventsOnlyTotal + souvenirCostTotal + extraCostTotal;
  const targetBudget = Number(trip.budget) || 0;
  const remaining = targetBudget - totalEstimated;
  const usageRatio =
    targetBudget > 0
      ? Math.min(100, Math.round((totalEstimated / targetBudget) * 100))
      : 0;
  const isOverBudget = targetBudget > 0 && totalEstimated > targetBudget;

  // カテゴリ別集計（閲覧専用＝みんなの旅では予定内の金額のみ集計し、おみやげ枠は除外）
  const categoryBreakdown = useMemo(() => {
    const map = {
      meal: 0,
      sightseeing: 0,
      transport: 0,
      active: 0,
      hotel: 0,
      souvenir: souvenirCostTotal,
    };
    events.forEach((ev) => {
      const c = Number(ev.cost) || 0;
      if (c > 0) {
        const key = map[ev.type] !== undefined ? ev.type : 'sightseeing';
        map[key] += c;
      }
    });
    if (!isReadOnly) {
      extraExpenses.forEach((ex) => {
        const c = Number(ex.amount) || 0;
        if (c > 0) {
          const key =
            map[ex.category] !== undefined ? ex.category : 'sightseeing';
          map[key] += c;
        }
      });
    }
    const categories = isReadOnly
      ? QUICK_TAGS
      : [...QUICK_TAGS, { id: 'souvenir', label: '🎁 おみやげ', icon: Heart }];
    return categories.map((tag) => ({
      ...tag,
      amount: map[tag.id] || 0,
      percent:
        totalEstimated > 0
          ? Math.round(((map[tag.id] || 0) / totalEstimated) * 100)
          : 0,
    }));
  }, [events, extraExpenses, souvenirCostTotal, totalEstimated, isReadOnly]);

  // ★「みんなの旅（閲覧モード）」のときは、予定に記載されている金額の合計と予定ごとの金額一覧・カテゴリ内訳のみをシンプルに表示
  if (isReadOnly) {
    return (
      <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
          <span className="text-[11px] font-bold text-stone-400 block mb-1">
            このしおりの予定に記載されている金額の合計（1人あたり）
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              ¥{eventsOnlyTotal.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#557465] bg-[#7A9D8C]/15 px-3 py-1 rounded-full">
              全 {events.length} 件の予定
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
            ※どのくらいの費用でどんな体験・食事・宿泊ができるかの目安としてご確認いただけます。
          </p>
        </div>

        {/* 予定ごとの金額明細リスト */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
          <h4 className="font-bold text-xs text-stone-700 mb-3 flex items-center gap-1.5">
            <Banknote size={14} className="text-[#7A9D8C]" /> 予定ごとの金額一覧
          </h4>
          {events.length === 0 ? (
            <p className="text-xs text-stone-400 font-bold text-center py-6">
              予定が登録されていません
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {events.map((ev, idx) => {
                const tagInfo =
                  QUICK_TAGS.find((t) => t.id === ev.type) || QUICK_TAGS[2];
                const TagIcon = tagInfo.icon;
                const costNum = Number(ev.cost) || 0;
                return (
                  <div
                    key={ev.id || idx}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-xl bg-[#7A9D8C]/10 text-[#7A9D8C] flex items-center justify-center shrink-0">
                        <TagIcon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-800 truncate">
                          {ev.title}
                        </p>
                        <p className="text-[10px] text-stone-400 font-bold">
                          {ev.date
                            ? `${ev.date.slice(5).replace('-', '/')} `
                            : ''}
                          {ev.time || ''}{' '}
                          {ev.location ? `・ ${ev.location}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-extrabold shrink-0 ${
                        costNum > 0 ? 'text-stone-800' : 'text-stone-400'
                      }`}
                    >
                      {costNum > 0 ? `¥${costNum.toLocaleString()}` : '¥0'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* カテゴリ別の費用内訳 */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
          <h4 className="font-bold text-xs text-stone-700 mb-3 flex items-center gap-1.5">
            <Activity size={14} className="text-[#7A9D8C]" />{' '}
            カテゴリ別の費用内訳
          </h4>
          <div className="space-y-2.5">
            {categoryBreakdown.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <CatIcon size={13} className="text-[#7A9D8C]" />{' '}
                      {cat.label}
                    </span>
                    <span className="text-stone-800">
                      ¥{cat.amount.toLocaleString()}{' '}
                      <span className="text-[10px] text-stone-400">
                        ({cat.percent}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7A9D8C]/80"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const handleSaveTargetBudget = () => {
    const nextVal = Math.max(0, Number(budgetDraft) || 0);
    updateTrip({ ...trip, budget: nextVal });
    setIsEditingBudget(false);
    customAlert('目標予算を更新しました！');
  };

  // おみやげの追加・プリセット追加・購入チェック・削除
  const handleAddSouvenir = (e) => {
    e.preventDefault();
    const amountNum = Number(souvenirAmount);
    if (!amountNum || amountNum <= 0 || isReadOnly) return;
    const finalTitle = souvenirTitle.trim() || `${souvenirTarget}のおみやげ`;
    const newItem = {
      id: generateId(),
      target: souvenirTarget,
      title: finalTitle,
      amount: amountNum,
      purchased: false,
    };
    updateTrip({ ...trip, souvenirList: [...souvenirList, newItem] });
    setSouvenirTitle('');
    setSouvenirAmount('');
    customAlert(
      `「${finalTitle} (¥${amountNum.toLocaleString()})」をおみやげ予算に追加しました！`
    );
  };

  const handleQuickAddSouvenir = (preset) => {
    if (isReadOnly) return;
    const newItem = {
      id: generateId(),
      target: preset.target,
      title: preset.title,
      amount: preset.amount,
      purchased: false,
    };
    updateTrip({ ...trip, souvenirList: [...souvenirList, newItem] });
    customAlert(
      `「${preset.title} (¥${preset.amount.toLocaleString()})」を追加しました！`
    );
  };

  const handleSetRoughSouvenirBudget = (roughAmount) => {
    if (isReadOnly) return;
    const newItem = {
      id: generateId(),
      target: 'その他',
      title: 'おみやげ予算枠（まとめ予算）',
      amount: roughAmount,
      purchased: false,
    };
    updateTrip({ ...trip, souvenirList: [...souvenirList, newItem] });
    customAlert(
      `おみやげ予算枠として ¥${roughAmount.toLocaleString()} を追加しました！`
    );
  };

  const handleToggleSouvenirPurchased = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      souvenirList: souvenirList.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      ),
    });
  };

  const handleDeleteSouvenir = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      souvenirList: souvenirList.filter((item) => item.id !== id),
    });
  };

  const handleAddExtraExpense = (e) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!expenseTitle.trim() || !amountNum || amountNum <= 0 || isReadOnly)
      return;
    const newExp = {
      id: generateId(),
      title: expenseTitle.trim(),
      amount: amountNum,
      category: expenseCategory,
      paidBy: currentUser?.name || 'メンバー',
      createdAt: getTodayString(),
    };
    updateTrip({ ...trip, extraExpenses: [newExp, ...extraExpenses] });
    setExpenseTitle('');
    setExpenseAmount('');
    customAlert('出費メモを追加しました');
  };

  const handleDeleteExtraExpense = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      extraExpenses: extraExpenses.filter((ex) => ex.id !== id),
    });
  };

  return (
    <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
      {/* 予算サマリーカード */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[11px] font-bold text-stone-400 block mb-0.5">
              現在の予定＋おみやげ＋出費合計（1人あたり）
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-extrabold ${
                  isOverBudget ? 'text-red-500' : 'text-stone-900'
                }`}
              >
                ¥{totalEstimated.toLocaleString()}
              </span>
              {targetBudget > 0 && (
                <span className="text-xs font-bold text-stone-400">
                  / 予算 ¥{targetBudget.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {!isReadOnly && (
            <button
              type="button"
              onClick={() => {
                setBudgetDraft(String(trip.budget || 50000));
                setIsEditingBudget(!isEditingBudget);
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Edit2 size={12} /> 予算変更
            </button>
          )}
        </div>

        {isEditingBudget && !isReadOnly && (
          <div className="mb-4 p-3 bg-stone-50 rounded-2xl border border-[#7A9D8C]/40 flex items-center gap-2 animate-in fade-in">
            <input
              type="number"
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              className="flex-1 p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold"
              placeholder="目標予算 (円)"
            />
            <button
              type="button"
              onClick={handleSaveTargetBudget}
              className="px-3.5 py-2 bg-[#7A9D8C] text-white rounded-xl text-xs font-bold"
            >
              保存
            </button>
          </div>
        )}

        {/* プログレスバー */}
        {targetBudget > 0 && (
          <>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverBudget
                    ? 'bg-red-500'
                    : usageRatio > 85
                    ? 'bg-amber-500'
                    : 'bg-[#7A9D8C]'
                }`}
                style={{ width: `${usageRatio}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-stone-400">消化率 {usageRatio}%</span>
              {remaining >= 0 ? (
                <span className="text-[#557465]">
                  あと ¥{remaining.toLocaleString()} 余裕あり
                </span>
              ) : (
                <span className="text-red-500">
                  予算を ¥{Math.abs(remaining).toLocaleString()} オーバー中
                </span>
              )}
            </div>
          </>
        )}

        {/* 確定分 / 提案中 / おみやげ / その他 の4分割内訳 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-stone-100 text-center">
          <div className="bg-stone-50 p-2.5 rounded-2xl">
            <p className="text-[10px] font-bold text-stone-400 mb-0.5">
              確定した予定
            </p>
            <p className="text-xs font-extrabold text-stone-800">
              ¥{approvedEventCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-amber-50/70 p-2.5 rounded-2xl">
            <p className="text-[10px] font-bold text-amber-700 mb-0.5">
              💡 提案中の予定
            </p>
            <p className="text-xs font-extrabold text-amber-800">
              ¥{proposedEventCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-rose-50/70 p-2.5 rounded-2xl border border-rose-100/80">
            <p className="text-[10px] font-bold text-rose-600 mb-0.5">
              🎁 おみやげ予算
            </p>
            <p className="text-xs font-extrabold text-rose-700">
              ¥{souvenirCostTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl">
            <p className="text-[10px] font-bold text-stone-400 mb-0.5">
              その他の出費
            </p>
            <p className="text-xs font-extrabold text-stone-800">
              ¥{extraCostTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 🎁 おみやげ予算・買い物リスト（ワンタップで簡単追加） */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-rose-100 space-y-3.5">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-stone-800 flex items-center gap-1.5">
              <span className="text-base">🎁</span> おみやげ予算・買い物リスト
            </h4>
            <p className="text-[11px] text-stone-400 font-bold mt-0.5">
              ワンタップで全体の予算におみやげ代を組み込めます
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-extrabold text-rose-600">
              ¥{souvenirCostTotal.toLocaleString()}
            </span>
            <p className="text-[10px] font-bold text-stone-400">
              {souvenirList.length}件
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <>
            {/* ざっくりおみやげ予算枠ボタン＆定番プリセット */}
            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/80 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-rose-700">
                  ⚡ ざっくりおみやげ予算枠を追加：
                </span>
                <div className="flex gap-1.5">
                  {[3000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSetRoughSouvenirBudget(amt)}
                      className="px-2.5 py-1 bg-white hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 rounded-lg text-[10px] font-extrabold transition-colors shadow-2xs active:scale-95"
                    >
                      ＋¥{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-rose-100/80">
                <span className="text-[10px] font-bold text-stone-500 block mb-1.5">
                  渡す相手別・ワンタップ追加：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SOUVENIR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickAddSouvenir(preset)}
                      className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-stone-700 border border-stone-200/90 rounded-xl text-[10px] font-bold transition-all active:scale-95 shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 個別のおみやげ入力フォーム */}
            <form onSubmit={handleAddSouvenir} className="space-y-2 pt-1">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {SOUVENIR_TARGETS.map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setSouvenirTarget(target)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 border transition-all ${
                      souvenirTarget === target
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={souvenirTitle}
                  onChange={(e) => setSouvenirTitle(e.target.value)}
                  placeholder={`${souvenirTarget}のおみやげ名 (省略可)`}
                  className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="number"
                  value={souvenirAmount}
                  onChange={(e) => setSouvenirAmount(e.target.value)}
                  placeholder="金額(円)"
                  className="w-24 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="submit"
                  disabled={!souvenirAmount}
                  className="px-3.5 py-2.5 bg-rose-500 text-white font-bold rounded-xl text-xs shadow-xs hover:bg-rose-600 disabled:opacity-40 transition-all shrink-0 flex items-center gap-1"
                >
                  <Plus size={14} /> 追加
                </button>
              </div>
            </form>
          </>
        )}

        {/* おみやげリスト一覧 */}
        {souvenirList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-center text-[11px] font-bold text-stone-400">
            まだおみやげ予算が登録されていません
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {souvenirList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleSouvenirPurchased(item.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  item.purchased
                    ? 'bg-stone-50/80 border-stone-200/70 text-stone-400'
                    : 'bg-white border-rose-100 shadow-2xs hover:border-rose-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.purchased
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {item.purchased && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 shrink-0">
                        {item.target}
                      </span>
                      <p
                        className={`text-xs font-bold truncate ${
                          item.purchased
                            ? 'line-through text-stone-400'
                            : 'text-stone-800'
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-rose-600">
                    ¥{Number(item.amount).toLocaleString()}
                  </span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSouvenir(item.id);
                      }}
                      className="p-1 text-stone-300 hover:text-red-500 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* カテゴリ別の費用内訳 */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
        <h4 className="font-bold text-xs text-stone-700 mb-3 flex items-center gap-1.5">
          <Activity size={14} className="text-[#7A9D8C]" /> カテゴリ別の費用内訳
        </h4>
        <div className="space-y-2.5">
          {categoryBreakdown.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <CatIcon
                      size={13}
                      className={
                        cat.id === 'souvenir'
                          ? 'text-rose-500'
                          : 'text-[#7A9D8C]'
                      }
                    />{' '}
                    {cat.label}
                  </span>
                  <span className="text-stone-800">
                    ¥{cat.amount.toLocaleString()}{' '}
                    <span className="text-[10px] text-stone-400">
                      ({cat.percent}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.id === 'souvenir' ? 'bg-rose-400' : 'bg-[#7A9D8C]/80'
                    }`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* その他の出費メモ（食べ歩き・タクシー割り勘など） */}
      {!isReadOnly && (
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100 space-y-3">
          <h4 className="font-bold text-xs text-stone-700 flex items-center gap-1.5">
            <Banknote size={14} className="text-[#7A9D8C]" />{' '}
            タイムライン外の出費メモを追加
          </h4>
          <form onSubmit={handleAddExtraExpense} className="space-y-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {QUICK_TAGS.map((tag) => {
                const TagIcon = tag.icon;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setExpenseCategory(tag.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 border transition-all ${
                      expenseCategory === tag.id
                        ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    <TagIcon size={11} /> {tag.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="項目（例：コインロッカー・飲み物）"
                className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="金額(円)"
                className="w-24 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
              <button
                type="submit"
                disabled={!expenseTitle.trim() || !expenseAmount}
                className="px-3.5 py-2.5 bg-[#7A9D8C] text-white font-bold rounded-xl text-xs shadow-xs hover:bg-[#688a79] disabled:opacity-40 transition-all shrink-0"
              >
                追加
              </button>
            </div>
          </form>

          {extraExpenses.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              {extraExpenses.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-stone-50 rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-stone-800">{ex.title}</span>
                    <span className="text-[10px] text-stone-400 ml-2">
                      ({ex.paidBy})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-stone-700">
                      ¥{Number(ex.amount).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExtraExpense(ex.id)}
                      className="text-stone-300 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CopyModal({
  type,
  sourceData,
  currentUser,
  myTrips,
  onClose,
  onOpenRegister,
  onComplete,
}) {
  const [step, setStep] = useState(1);
  const [createdGroupTrip, setCreatedGroupTrip] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInviteMsg, setCopiedInviteMsg] = useState(false);

  // ★ 1人旅 / 複数人（グループ）旅の選択ステート
  const [copyMode, setCopyMode] = useState('solo'); // 'solo' | 'group'
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  // 過去の旅を除外し、現在選択されているスタイル（1人旅 / みんなの旅）に一致するこれからの旅のみを抽出
  const todayStr = getTodayString();
  const filteredTargetTrips = useMemo(() => {
    return (myTrips || []).filter((t) => {
      const endDate = t.endDate || t.startDate || '';
      if (endDate < todayStr) return false; // 過去のしおりは除外
      return copyMode === 'solo' ? Boolean(t.isSoloTrip) : !t.isSoloTrip;
    });
  }, [myTrips, copyMode, todayStr]);

  const [selectedTripId, setSelectedTripId] = useState(() => {
    if (type === 'trip') return 'new';
    const initialSoloTrips = (myTrips || []).filter(
      (t) =>
        (t.endDate || t.startDate || '') >= todayStr && Boolean(t.isSoloTrip)
    );
    return initialSoloTrips.length > 0 ? initialSoloTrips[0].id : 'new';
  });

  // スタイル切り替え時、選択中のしおりが現在のスタイルに含まれない場合は自動でリセット
  useEffect(() => {
    if (
      selectedTripId !== 'new' &&
      !filteredTargetTrips.some((t) => t.id === selectedTripId)
    ) {
      setSelectedTripId('new');
    }
  }, [copyMode, filteredTargetTrips, selectedTripId]);

  const [newTripTitle, setNewTripTitle] = useState(
    type === 'trip'
      ? `${sourceData.title || '新しい旅行'}（コピー）`
      : type === 'event'
      ? `${sourceData.title || 'お出かけ'}の旅`
      : '新しい旅行計画'
  );
  const [newStartDate, setNewStartDate] = useState(getTodayString());

  const buildNewTripMembers = () => {
    return [{ ...currentUser, color: PRESET_COLORS[0] }];
  };

  // 時間調整用のステート
  const [customEventTime, setCustomEventTime] = useState(
    type === 'event' ? sourceData.time || '12:00' : '12:00'
  );
  const [customEventTimesMap, setCustomEventTimesMap] = useState(() => {
    const initialMap = {};
    const list =
      type === 'trip'
        ? sourceData.events || []
        : type === 'day'
        ? sourceData || []
        : [];
    list.forEach((ev, idx) => {
      initialMap[ev.id || idx] = ev.time || '12:00';
    });
    return initialMap;
  });

  const targetTrip = myTrips.find((t) => t.id === selectedTripId);

  const generateDateList = (start, end) => {
    const arr = [];
    let dt = new Date(start);
    const endDt = new Date(end || start);
    let safety = 0;
    while (dt <= endDt && safety < 30) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
      safety++;
    }
    return arr.length > 0 ? arr : [getTodayString()];
  };

  const targetDates = useMemo(() => {
    if (selectedTripId === 'new') return [newStartDate];
    if (targetTrip)
      return generateDateList(targetTrip.startDate, targetTrip.endDate);
    return [getTodayString()];
  }, [selectedTripId, targetTrip, newStartDate]);

  const [selectedDate, setSelectedDate] = useState(
    targetDates[0] || getTodayString()
  );

  useEffect(() => {
    if (targetDates.length > 0 && !targetDates.includes(selectedDate)) {
      setSelectedDate(targetDates[0]);
    }
  }, [targetDates]);

  const handleSave = () => {
    const isSoloMode = copyMode === 'solo';
    if (!isSoloMode && currentUser?.isGuest) {
      setShowGuestPrompt(true);
      return;
    }

    const parseSafeDate = (dateStr) => {
      const d = new Date(dateStr || getTodayString());
      return isNaN(d.getTime()) ? new Date(getTodayString()) : d;
    };

    if (type === 'trip') {
      if (selectedTripId === 'new') {
        const start = parseSafeDate(newStartDate);
        const origStart = parseSafeDate(
          sourceData.startDate || getTodayString()
        );
        const origEnd = parseSafeDate(
          sourceData.endDate || sourceData.startDate || getTodayString()
        );
        const diffDays = Math.max(
          0,
          Math.round((origEnd - origStart) / (1000 * 60 * 60 * 24))
        );
        const end = new Date(start);
        end.setDate(end.getDate() + diffDays);
        const endStr = end.toISOString().split('T')[0];

        const shiftedEvents = (sourceData.events || []).map((ev, idx) => {
          const evDate = parseSafeDate(
            ev.date || sourceData.startDate || getTodayString()
          );
          const dayOffset = Math.max(
            0,
            Math.round((evDate - origStart) / (1000 * 60 * 60 * 24))
          );
          const newEvDate = new Date(start);
          newEvDate.setDate(newEvDate.getDate() + dayOffset);
          return {
            ...ev,
            id: generateId(),
            date: newEvDate.toISOString().split('T')[0],
            time: customEventTimesMap[ev.id || idx] || ev.time || '12:00',
            status: isSoloMode ? 'approved' : 'proposed',
            authorId: currentUser.id,
            photos: [],
          };
        });

        const totalEventsCost = shiftedEvents.reduce(
          (sum, e) => sum + (Number(e.cost) || 0),
          0
        );

        const newTripObj = {
          id: generateTripCode(),
          title:
            newTripTitle.trim() ||
            `${sourceData.title || '旅行計画'}（コピー）`,
          destination: sourceData.destination || '未設定',
          startDate: newStartDate,
          endDate: endStr,
          budget:
            totalEventsCost > 0
              ? totalEventsCost
              : Number(sourceData.budget) || 50000,
          members: buildNewTripMembers(),
          isSoloTrip: isSoloMode,
          events: shiftedEvents,
          photos: [],
          packingList: [],
          extraExpenses: [],
          souvenirList: [],
        };

        if (!isSoloMode) {
          setCreatedGroupTrip(newTripObj);
          setStep(2);
          return;
        }
        onComplete(newTripObj, null);
      } else if (targetTrip) {
        const origStart = parseSafeDate(
          sourceData.startDate || getTodayString()
        );
        const targetStart = parseSafeDate(targetTrip.startDate);
        const targetEnd = parseSafeDate(targetTrip.endDate);

        const mergedEvents = (sourceData.events || []).map((ev, idx) => {
          const evDate = parseSafeDate(
            ev.date || sourceData.startDate || getTodayString()
          );
          const dayOffset = Math.max(
            0,
            Math.round((evDate - origStart) / (1000 * 60 * 60 * 24))
          );
          const mappedDate = new Date(targetStart);
          mappedDate.setDate(mappedDate.getDate() + dayOffset);
          const finalDate =
            mappedDate <= targetEnd
              ? mappedDate.toISOString().split('T')[0]
              : targetTrip.endDate;
          return {
            ...ev,
            id: generateId(),
            date: finalDate,
            time: customEventTimesMap[ev.id || idx] || ev.time || '12:00',
            status: targetTrip.isSoloTrip ? 'approved' : 'proposed',
            authorId: currentUser.id,
            photos: [],
          };
        });

        onComplete(null, {
          ...targetTrip,
          events: [...(targetTrip.events || []), ...mergedEvents],
        });
      }
      return;
    }

    const rawEvents =
      type === 'event'
        ? [sourceData]
        : Array.isArray(sourceData)
        ? sourceData
        : [];

    if (selectedTripId === 'new') {
      const newEvents = rawEvents.map((e, idx) => ({
        ...e,
        id: generateId(),
        date: newStartDate,
        time:
          type === 'event'
            ? customEventTime
            : customEventTimesMap[e.id || idx] || e.time || '12:00',
        status: isSoloMode ? 'approved' : 'proposed',
        authorId: currentUser.id,
      }));
      const newTripObj = {
        id: generateTripCode(),
        title: newTripTitle.trim() || '新しい旅行計画',
        destination: rawEvents[0]?.location || '行き先未定',
        startDate: newStartDate,
        endDate: newStartDate,
        budget: 50000,
        members: buildNewTripMembers(),
        isSoloTrip: isSoloMode,
        events: newEvents,
        photos: [],
      };
      if (!isSoloMode) {
        setCreatedGroupTrip(newTripObj);
        setStep(2);
        return;
      }
      onComplete(newTripObj, null);
    } else if (targetTrip) {
      const newEvents = rawEvents.map((e, idx) => ({
        ...e,
        id: generateId(),
        date: selectedDate,
        time:
          type === 'event'
            ? customEventTime
            : customEventTimesMap[e.id || idx] || e.time || '12:00',
        status: targetTrip.isSoloTrip ? 'approved' : 'proposed',
        authorId: currentUser.id,
      }));
      onComplete(null, {
        ...targetTrip,
        events: [...(targetTrip.events || []), ...newEvents],
      });
    }
  };

  const multiEventsList =
    type === 'trip'
      ? sourceData.events || []
      : type === 'day'
      ? sourceData || []
      : [];

  const handleCopyInviteCode = () => {
    if (!createdGroupTrip) return;
    copyToClipboard(
      createdGroupTrip.id,
      `招待コード「${createdGroupTrip.id}」をコピーしました！`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyInviteWithAppUrl = () => {
    if (!createdGroupTrip) return;
    const inviteText = `「${createdGroupTrip.title}」の旅行計画を一緒に作ろう！✈️\n\n▼ 招待コード\n${createdGroupTrip.id}\n\n▼ アプリをまだ持っていない方はこちら（インストールURL）\nhttps://tabitabi.app/dl`;
    copyToClipboard(inviteText, 'アプリ紹介URL付きの招待文をコピーしました！');
    setCopiedInviteMsg(true);
    setTimeout(() => setCopiedInviteMsg(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 max-h-[88vh] flex flex-col pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
            <Copy size={18} className="text-[#7A9D8C]" />
            {step === 2
              ? 'メンバーの招待・共有コード'
              : type === 'trip'
              ? 'しおりをコピーして使う'
              : type === 'day'
              ? '1日分の予定をコピー'
              : 'この予定をコピー'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {step === 2 && createdGroupTrip ? (
          <div className="space-y-5 text-center animate-in slide-in-from-right-4 py-2">
            <div className="bg-[#7A9D8C]/10 p-5 rounded-3xl border border-[#7A9D8C]/20">
              <p className="text-xs font-bold text-[#7A9D8C] mb-2">
                コピーしたしおりの共有・招待コード
              </p>
              <div className="flex items-center justify-between gap-2 bg-white py-2.5 px-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <span className="text-lg sm:text-xl font-mono font-extrabold tracking-widest text-stone-800 select-all flex-1 text-center pl-2">
                  {createdGroupTrip.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors active:scale-95 ${
                    copiedCode
                      ? 'bg-[#7A9D8C] text-white'
                      : 'bg-[#7A9D8C]/15 hover:bg-[#7A9D8C]/25 text-[#557465]'
                  }`}
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? 'コピー済' : 'コピー'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopyInviteWithAppUrl}
                className={`w-full mt-3 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                  copiedInviteMsg
                    ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                    : 'bg-white hover:bg-stone-50 text-[#557465] border-[#7A9D8C]/30 shadow-2xs'
                }`}
              >
                {copiedInviteMsg ? <Check size={14} /> : <Share2 size={14} />}
                <span>
                  {copiedInviteMsg
                    ? '招待文をコピーしました！'
                    : 'アプリ紹介リンク付きで招待文をコピー'}
                </span>
              </button>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              友達やパートナーにこのコードを共有すると、
              <br />
              コピーしたしおりを一緒に編集できるようになります。
              <br />
              <span className="text-[11px] text-stone-400">
                （※しおり右上のメニューからいつでも再確認できます）
              </span>
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onComplete(createdGroupTrip, null)}
                className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 hover:bg-[#688a79] transition-colors"
              >
                コピーしたしおりを開く <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 mb-0.5">
                  コピーする内容
                </p>
                <p className="text-xs font-bold text-stone-700 truncate">
                  {type === 'trip'
                    ? `${sourceData.title}（全${
                        (sourceData.events || []).length
                      }件の予定）`
                    : type === 'day'
                    ? `選択した日の予定（${(sourceData || []).length}件）`
                    : `${sourceData.title}`}
                </p>
              </div>

              {/* ★ 「1人旅 / 複数人（グループ）旅」選択UI（常時表示し、コピー先候補も連動して切り替わる） */}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 pl-1">
                  旅のスタイルを選択してください
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCopyMode('solo');
                      setShowGuestPrompt(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      copyMode === 'solo'
                        ? 'border-[#7A9D8C] bg-[#7A9D8C]/10 shadow-2xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-lg">👤</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          copyMode === 'solo'
                            ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {copyMode === 'solo' && (
                          <Check size={10} strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs font-extrabold ${
                        copyMode === 'solo'
                          ? 'text-[#557465]'
                          : 'text-stone-800'
                      }`}
                    >
                      1人旅としてコピー
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold mt-0.5 leading-snug">
                      自分専用のしおり（承認なしで即確定）
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser?.isGuest) {
                        setShowGuestPrompt(true);
                        return;
                      }
                      setCopyMode('group');
                      setShowGuestPrompt(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      copyMode === 'group'
                        ? 'border-[#7A9D8C] bg-[#7A9D8C]/10 shadow-2xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-lg">👥</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          copyMode === 'group'
                            ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {copyMode === 'group' && (
                          <Check size={10} strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs font-extrabold ${
                        copyMode === 'group'
                          ? 'text-[#557465]'
                          : 'text-stone-800'
                      }`}
                    >
                      みんなの旅としてコピー
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold mt-0.5 leading-snug">
                      複数人用（予定は提案中になり承認が必要）
                    </p>
                  </button>
                </div>

                {/* ゲスト利用時に「みんなの旅としてコピー」を選んだ場合の案内バナー */}
                {showGuestPrompt && currentUser?.isGuest && (
                  <div className="mt-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in space-y-2">
                    <div className="flex items-start gap-2 text-red-600">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <p className="text-xs font-bold leading-relaxed">
                        複数人でのしおり作成・コピーにはアカウント登録（無料）が必要です。
                      </p>
                    </div>
                    {onOpenRegister && (
                      <button
                        type="button"
                        onClick={onOpenRegister}
                        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                      >
                        無料アカウント登録・ログインへ進む
                      </button>
                    )}
                  </div>
                )}
              </div>

              {selectedTripId === 'new' && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 block mb-1">
                      新しいしおりの名前
                    </label>
                    <input
                      type="text"
                      value={newTripTitle}
                      onChange={(e) => setNewTripTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 block mb-1">
                      出発日
                    </label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2 pl-1">
                  <label className="block text-xs font-bold text-stone-500">
                    コピー先のしおり（
                    {copyMode === 'solo'
                      ? '👤 1人旅のみ'
                      : '👥 参加中の共有しおりのみ'}
                    ）
                  </label>
                  <span className="text-[10px] font-bold text-stone-400">
                    ※過去の旅は非表示
                  </span>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTripId('new')}
                    className={`w-full p-3.5 rounded-2xl border-2 border-dashed text-left transition-all flex items-center justify-between gap-2 ${
                      selectedTripId === 'new'
                        ? 'border-[#7A9D8C] bg-[#7A9D8C]/10 text-[#557465]'
                        : 'border-stone-300 bg-stone-50/70 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          selectedTripId === 'new'
                            ? 'bg-[#7A9D8C] text-white'
                            : 'bg-white text-stone-500 border border-stone-200'
                        }`}
                      >
                        <Plus size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">
                          新しいしおりを作成してコピー
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {copyMode === 'solo'
                            ? '👤 1人旅のしおりとして新規作成'
                            : '👥 みんなの旅（複数人用）として新規作成'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedTripId === 'new'
                          ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {selectedTripId === 'new' && (
                        <Check size={12} strokeWidth={3} />
                      )}
                    </div>
                  </button>

                  {filteredTargetTrips.length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-center text-[11px] font-bold text-stone-400">
                      {copyMode === 'solo'
                        ? '進行中・これからの「1人旅のしおり」はありません'
                        : '進行中・これからの「共有のしおり（みんなの旅）」はありません'}
                    </div>
                  ) : (
                    filteredTargetTrips.map((t) => {
                      const isSelected = selectedTripId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTripId(t.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'border-[#7A9D8C] bg-[#7A9D8C]/10 shadow-2xs'
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p
                                className={`text-xs font-bold truncate ${
                                  isSelected
                                    ? 'text-[#557465]'
                                    : 'text-stone-800'
                                }`}
                              >
                                {t.title}
                              </p>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 shrink-0">
                                {t.isSoloTrip
                                  ? '👤 1人旅'
                                  : `👥 共有（${(t.members || []).length}人）`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} />
                                {t.destination || '未設定'}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Calendar size={10} />
                                {t.startDate?.replace(/-/g, '/')}〜
                              </span>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white'
                                : 'border-stone-300'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedTripId !== 'new' && (
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2 pl-1">
                    追加する日程（何日目）を選択
                  </label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {targetDates.map((d, idx) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                          selectedDate === d
                            ? 'bg-[#7A9D8C] text-white border-[#7A9D8C] shadow-2xs'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {idx + 1}日目 ({d.slice(5).replace('-', '/')})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 pl-1">
                  予定の時間を設定（変更可能）
                </label>
                {type === 'event' ? (
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                      <Clock size={15} className="text-[#7A9D8C]" />
                      <span>開始時間</span>
                    </div>
                    <input
                      type="time"
                      value={customEventTime}
                      onChange={(e) => setCustomEventTime(e.target.value)}
                      className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                ) : (
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2 max-h-44 overflow-y-auto no-scrollbar">
                    {multiEventsList.length === 0 ? (
                      <p className="text-[11px] text-stone-400 font-bold text-center py-2">
                        コピー対象の予定がありません
                      </p>
                    ) : (
                      multiEventsList.map((ev, idx) => {
                        const key = ev.id || idx;
                        return (
                          <div
                            key={key}
                            className="bg-white p-2.5 rounded-xl border border-stone-100 flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-bold text-stone-700 truncate flex-1">
                              {ev.title}
                            </span>
                            <input
                              type="time"
                              value={
                                customEventTimesMap[key] || ev.time || '12:00'
                              }
                              onChange={(e) =>
                                setCustomEventTimesMap((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] shrink-0"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-stone-100 text-stone-600 font-bold rounded-2xl text-xs hover:bg-stone-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-[2] py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-xs hover:bg-[#688a79] transition-colors flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>
                  {selectedTripId === 'new'
                    ? copyMode === 'solo'
                      ? '👤 1人旅としてコピーする'
                      : '次へ（招待コードを表示）'
                    : '選択したしおりにコピーする'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Timeline({
  trip,
  updateTrip,
  selectedDate,
  currentUser,
  isReadOnly,
  onCopyEvent,
  onCopyDay,
  onEnlargeImage,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [insertIndex, setInsertIndex] = useState(null);
  const [insertDefaultTime, setInsertDefaultTime] = useState(null);
  const [showAiSuggestModal, setShowAiSuggestModal] = useState(false);
  const [aiInitialData, setAiInitialData] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  const currentEvents = (trip.events || []).filter(
    (e) => e.date === selectedDate
  );
  currentEvents.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  // 2つの予定の時間から中間の時間を計算する関数（例: 10:30 と 12:00 → 11:15）
  const getMidpointTime = (timeA, timeB) => {
    const toMinutes = (t) => {
      if (!t || !t.includes(':')) return 12 * 60;
      const [h, m] = t.split(':').map(Number);
      return (isNaN(h) ? 12 : h) * 60 + (isNaN(m) ? 0 : m);
    };
    const minA = toMinutes(timeA);
    const minB = timeB ? toMinutes(timeB) : minA + 60;
    const mid =
      minB > minA
        ? Math.round((minA + minB) / 2)
        : Math.min(23 * 60 + 55, minA + 30);
    const roundedMid = Math.round(mid / 5) * 5;
    const hh = String(Math.floor(roundedMid / 60) % 24).padStart(2, '0');
    const mm = String(roundedMid % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleOpenInsertBetween = (idx, prevTime, nextTime) => {
    const midTime = getMidpointTime(prevTime, nextTime);
    setInsertIndex(idx);
    setInsertDefaultTime(midTime);
    setAiInitialData(null);
    setShowAddForm(false);
  };

  // 写真削除の確認モーダル用ステート
  const [photoToDelete, setPhotoToDelete] = useState(null); // { eventId, photo }

  // 投稿した本人かどうか判定するヘルパー
  const isMyPhoto = (photo) => {
    if (!photo || !currentUser) return false;
    if (photo.authorId) return photo.authorId === currentUser.id;
    if (photo.authorName) {
      return (
        photo.authorName === currentUser.name ||
        currentUser.name.startsWith(photo.authorName) ||
        photo.authorName.startsWith(currentUser.name)
      );
    }
    return true;
  };

  const handleAddEventPhoto = (eventId, photoUrl) => {
    const newPhotoObj = {
      id: generateId(),
      url: photoUrl,
      createdAt: getTodayString(),
      eventId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      isPublic: true,
    };
    updateTrip({
      ...trip,
      events: (trip.events || []).map((e) =>
        e.id === eventId
          ? { ...e, photos: [...(e.photos || []), newPhotoObj] }
          : e
      ),
      photos: [newPhotoObj, ...(trip.photos || [])],
    });
    customAlert(
      '予定に思い出写真を追加しました！（公開設定も切り替えられます）'
    );
  };

  const handleToggleEventPhotoPublic = (eventId, photoId) => {
    updateTrip({
      ...trip,
      events: (trip.events || []).map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          photos: (e.photos || []).map((p) =>
            p.id === photoId
              ? { ...p, isPublic: p.isPublic === false ? true : false }
              : p
          ),
        };
      }),
      photos: (trip.photos || []).map((p) =>
        p.id === photoId
          ? { ...p, isPublic: p.isPublic === false ? true : false }
          : p
      ),
    });
  };

  const handleDeleteEventPhoto = (eventId, photoId) => {
    updateTrip({
      ...trip,
      events: (trip.events || []).map((e) =>
        e.id === eventId
          ? { ...e, photos: (e.photos || []).filter((p) => p.id !== photoId) }
          : e
      ),
      photos: (trip.photos || []).filter((p) => p.id !== photoId),
    });
    customAlert('思い出写真を削除しました');
  };

  return (
    <div className="p-5 pb-28">
      {isReadOnly && currentEvents.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => onCopyDay(currentEvents)}
            className="px-3 py-1.5 bg-[#7A9D8C]/10 text-[#7A9D8C] rounded-full text-xs font-bold flex items-center gap-1 hover:bg-[#7A9D8C]/20 transition-colors"
          >
            <Copy size={12} /> この日の予定をコピー
          </button>
        </div>
      )}
      <div className="relative border-l-2 border-stone-200 ml-4 space-y-3 pt-2">
        {currentEvents.length === 0 && !showAddForm && insertIndex === null ? (
          <div className="pl-6 text-stone-400 text-xs font-bold py-10 flex flex-col items-start gap-1">
            <Compass size={22} className="opacity-40 mb-1" />
            この日の予定はまだありません。
          </div>
        ) : (
          currentEvents.map((event, idx) => {
            const nextEvent = currentEvents[idx + 1];
            const suggestedMidTime = nextEvent
              ? getMidpointTime(event.time, nextEvent.time)
              : null;
            return (
              <React.Fragment key={event.id}>
                <EventCard
                  event={event}
                  trip={trip}
                  isReadOnly={isReadOnly}
                  currentUser={currentUser}
                  onApprove={() =>
                    updateTrip({
                      ...trip,
                      events: (trip.events || []).map((e) =>
                        e.id === event.id ? { ...e, status: 'approved' } : e
                      ),
                    })
                  }
                  onUpdateMemo={(newMemo) =>
                    updateTrip({
                      ...trip,
                      events: (trip.events || []).map((e) =>
                        e.id === event.id ? { ...e, memo: newMemo } : e
                      ),
                    })
                  }
                  onDelete={() => setEventToDelete(event)}
                  onCopy={() => onCopyEvent(event)}
                  onAddPhoto={(url) => handleAddEventPhoto(event.id, url)}
                  onTogglePhotoPublic={(photoId) =>
                    handleToggleEventPhotoPublic(event.id, photoId)
                  }
                  onRequestDeletePhoto={(photo) => {
                    if (!isMyPhoto(photo)) {
                      customAlert('他のメンバーが投稿した写真は削除できません');
                      return;
                    }
                    setPhotoToDelete({ eventId: event.id, photo });
                  }}
                  canDeletePhoto={isMyPhoto}
                  onEnlargeImage={onEnlargeImage}
                />

                {/* 予定と予定の間で直感的に新しい予定を追加できるボタン＆フォーム */}
                {!isReadOnly &&
                  idx < currentEvents.length - 1 &&
                  (insertIndex === idx ? (
                    <div className="pl-6 py-2 relative animate-in fade-in slide-in-from-top-2">
                      <InlineEventForm
                        onSave={(newEv) => {
                          updateTrip({
                            ...trip,
                            events: [...(trip.events || []), newEv],
                          });
                          setInsertIndex(null);
                          setInsertDefaultTime(null);
                        }}
                        onCancel={() => {
                          setInsertIndex(null);
                          setInsertDefaultTime(null);
                        }}
                        date={selectedDate}
                        trip={trip}
                        currentUser={currentUser}
                        initialData={{ time: insertDefaultTime }}
                      />
                    </div>
                  ) : (
                    <div className="pl-6 py-0.5 relative flex items-center group/insert">
                      <div className="absolute -left-[5px] w-2 h-2 rounded-full bg-stone-300 group-hover/insert:bg-[#7A9D8C] transition-colors" />
                      <div className="w-full flex items-center gap-2">
                        <div className="h-px flex-1 border-t border-dashed border-stone-200 group-hover/insert:border-[#7A9D8C]/50 transition-colors" />
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenInsertBetween(
                              idx,
                              event.time,
                              nextEvent?.time
                            )
                          }
                          className="px-3 py-1 rounded-full bg-white hover:bg-[#7A9D8C] text-stone-500 hover:text-white border border-stone-200/90 hover:border-[#7A9D8C] text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                        >
                          <Plus size={12} />
                          <span>
                            ここに予定を追加
                            {suggestedMidTime ? ` (${suggestedMidTime}頃)` : ''}
                          </span>
                        </button>
                        <div className="h-px flex-1 border-t border-dashed border-stone-200 group-hover/insert:border-[#7A9D8C]/50 transition-colors" />
                      </div>
                    </div>
                  ))}
              </React.Fragment>
            );
          })
        )}
        {showAddForm && !isReadOnly && (
          <div className="pl-6 relative animate-in fade-in slide-in-from-top-2">
            <InlineEventForm
              onSave={(e) => {
                updateTrip({ ...trip, events: [...(trip.events || []), e] });
                setShowAddForm(false);
                setAiInitialData(null);
              }}
              onCancel={() => {
                setShowAddForm(false);
                setAiInitialData(null);
              }}
              date={selectedDate}
              trip={trip}
              currentUser={currentUser}
              initialData={aiInitialData}
            />
          </div>
        )}
      </div>

      {!isReadOnly && !showAddForm && (
        <div className="mt-6 pl-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setInsertIndex(null);
              const lastEvent = currentEvents[currentEvents.length - 1];
              if (lastEvent?.time) {
                setAiInitialData({
                  time: getMidpointTime(lastEvent.time, null),
                });
              } else {
                setAiInitialData(null);
              }
              setShowAddForm(true);
            }}
            className="flex-1 py-3.5 bg-white text-[#7A9D8C] border-2 border-dashed border-[#7A9D8C]/40 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#7A9D8C]/5 transition-colors shadow-2xs"
          >
            <Plus size={16} /> 予定を追加
          </button>
          <button
            type="button"
            onClick={() => setShowAiSuggestModal(true)}
            className="px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition-opacity"
          >
            <Sparkles size={15} /> AI提案
          </button>
        </div>
      )}

      {showAiSuggestModal && (
        <EventAiSuggestModal
          trip={trip}
          onClose={() => setShowAiSuggestModal(false)}
          onSelect={(suggestedEvent) => {
            setInsertIndex(null);
            setAiInitialData(suggestedEvent);
            setShowAiSuggestModal(false);
            setShowAddForm(true);
          }}
        />
      )}

      {/* 予定の削除確認モーダル */}
      {eventToDelete && (
        <div
          className="fixed inset-0 bg-black/60 z-[260] flex justify-center items-center p-4 animate-in fade-in"
          onClick={() => setEventToDelete(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">
              この予定を削除しますか？
            </h3>
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 mb-4 text-left">
              {eventToDelete.time && (
                <p className="text-[10px] font-bold text-[#7A9D8C] flex items-center gap-1 mb-0.5">
                  <Clock size={11} /> {eventToDelete.time}
                </p>
              )}
              <p className="text-xs font-bold text-stone-800">
                {eventToDelete.title}
              </p>
              {eventToDelete.location && (
                <p className="text-[10px] text-stone-500 font-bold mt-1 flex items-center gap-1">
                  <MapPin size={10} className="text-red-500" />{' '}
                  {eventToDelete.location}
                </p>
              )}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mb-5">
              削除した予定は元に戻せません。よろしいですか？
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  updateTrip({
                    ...trip,
                    events: (trip.events || []).filter(
                      (e) => e.id !== eventToDelete.id
                    ),
                  });
                  setEventToDelete(null);
                  customAlert('予定を削除しました');
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} /> 削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 予定内の思い出写真 削除確認モーダル */}
      {photoToDelete && (
        <div
          className="fixed inset-0 bg-black/60 z-[270] flex justify-center items-center p-4 animate-in fade-in"
          onClick={() => setPhotoToDelete(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">
              この写真を削除しますか？
            </h3>
            <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-3 border border-stone-200 shadow-xs bg-stone-100">
              <img
                src={photoToDelete.photo.url}
                alt="削除対象の写真"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mb-5">
              削除すると、しおりと旅の思い出アルバムの両方からこの写真が消去されます。よろしいですか？
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteEventPhoto(
                    photoToDelete.eventId,
                    photoToDelete.photo.id
                  );
                  setPhotoToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} /> 削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PublishModal({ trip, currentUser, onClose, onPublish }) {
  const [step, setStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState(() => {
    // 初期状態で各予定の公開OKな写真があれば最大4枚までカバー候補にもセット可能にする
    const eventUrls = [];
    (trip.events || []).forEach((ev) => {
      (ev.photos || []).forEach((p) => {
        if (p.isPublic !== false && p.url && !eventUrls.includes(p.url)) {
          eventUrls.push(p.url);
        }
      });
    });
    return eventUrls.slice(0, 4);
  });
  const [region, setRegion] = useState(REGIONS[1]);
  const [description, setDescription] = useState('');
  // デフォルトでは予定のメモを共有しない（個人情報や予約番号保護のため false）
  const [shareMemos, setShareMemos] = useState(false);

  // 各予定に紐づく写真のうち「みんなの旅」に一緒に公開する写真IDのセット（初期値は各写真の isPublic !== false のもの）
  const [selectedEventPhotoIds, setSelectedEventPhotoIds] = useState(() => {
    const ids = [];
    (trip.events || []).forEach((ev) => {
      (ev.photos || []).forEach((p) => {
        if (p.isPublic !== false && p.id) ids.push(p.id);
      });
    });
    return ids;
  });

  const fileInputRef = useRef(null);

  const eventsWithMemos = useMemo(
    () => (trip.events || []).filter((e) => e.memo && e.memo.trim().length > 0),
    [trip.events]
  );

  const eventsWithPhotos = useMemo(
    () =>
      (trip.events || []).filter(
        (e) => Array.isArray(e.photos) && e.photos.length > 0
      ),
    [trip.events]
  );

  const toggleEventPhotoSelection = (photoId) => {
    setSelectedEventPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newUrls = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setSelectedImages([...selectedImages, ...newUrls].slice(0, 4));
    }
  };

  const handleProceedToConfirm = () => {
    if (selectedImages.length === 0) {
      customAlert('公開用のカバー写真を1枚以上選んでください。');
      return;
    }
    setStep(2);
  };

  const handleFinalPublish = () => {
    // 各予定に紐づく写真のうち、ユーザーが公開を選択した写真（selectedEventPhotoIdsに含まれるもの）だけを残して公開する
    const sanitizedEvents = (trip.events || []).map(
      ({ photos, memo, ...eventRest }) => {
        const publicPhotos = Array.isArray(photos)
          ? photos
              .filter((p) => selectedEventPhotoIds.includes(p.id))
              .map((p) => ({ ...p, isPublic: true }))
          : [];
        return {
          ...eventRest,
          memo: shareMemos ? memo || '' : '',
          status: 'approved',
          authorId: currentUser.id,
          photos: publicPhotos,
        };
      }
    );

    // 公開時の予算は予定内に記載されている金額の合計のみを記録する
    const totalEventsCost = sanitizedEvents.reduce(
      (sum, ev) => sum + (Number(ev.cost) || 0),
      0
    );

    onPublish({
      id: 'PUB-' + generateId(),
      title: trip.title,
      description,
      destination: trip.destination,
      region,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: totalEventsCost,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorBio: currentUser.bio || '',
      covers: selectedImages,
      likes: 0,
      views: 0,
      likedBy: [],
      publishedAt: Date.now(),
      members: [
        { id: currentUser.id, name: currentUser.name, color: '#7A9D8C' },
      ],
      events: sanitizedEvents,
      packingList: [],
      extraExpenses: [],
      souvenirList: [],
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-base text-stone-800 flex items-center gap-2">
            <Globe size={18} className="text-[#7A9D8C]" />
            {step === 1 ? 'しおりを「みんなの旅」に公開' : '投稿内容の最終確認'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div className="animate-in fade-in">
            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-500 mb-1.5">
                地域エリア
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${
                      region === r
                        ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-500 mb-1.5">
                旅の説明・おすすめポイント
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="旅の感想やおすすめポイントなど..."
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none"
              />
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-stone-500">
                  公開用のカバー写真を選択 (最大4枚)
                </label>
                <span className="text-xs font-bold text-[#7A9D8C]">
                  {selectedImages.length}/4枚
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 shadow-sm group"
                  >
                    <img
                      src={url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImages(
                          selectedImages.filter((_, i) => i !== idx)
                        )
                      }
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {selectedImages.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
                  >
                    <Plus size={22} className="mb-1" />
                    <span className="text-[10px] font-bold">写真を選ぶ</span>
                  </button>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* 各予定の写真を「みんなの旅」に載せるかどうかの個別選択セクション */}
            <div className="mb-5 p-4 rounded-2xl border border-stone-200 bg-stone-50/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Camera size={14} className="text-[#7A9D8C]" />
                  各予定の写真を「みんなの旅」に公開する
                </label>
                <span className="text-[11px] font-bold text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full">
                  {selectedEventPhotoIds.length}枚を公開
                </span>
              </div>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                公開したい写真をタップして選択できます。チェックした写真は「みんなの旅」の各予定カード内に表示され、どんな場所・料理だったのかが他の人にも伝わります！
              </p>

              {eventsWithPhotos.length === 0 ? (
                <div className="p-3 bg-white rounded-xl border border-stone-200/70 text-[11px] text-stone-400 font-bold text-center">
                  まだ各予定に貼られた写真がありません（予定カードの「思い出の写真を貼る」から追加できます）
                </div>
              ) : (
                <div className="space-y-2.5 max-h-52 overflow-y-auto no-scrollbar pr-0.5">
                  {eventsWithPhotos.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-2"
                    >
                      <p className="text-[11px] font-bold text-stone-700 truncate">
                        {ev.time} {ev.title}
                      </p>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                        {(ev.photos || []).map((p) => {
                          const isSelected = selectedEventPhotoIds.includes(
                            p.id
                          );
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleEventPhotoSelection(p.id)}
                              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                isSelected
                                  ? 'border-[#7A9D8C] ring-2 ring-[#7A9D8C]/30'
                                  : 'border-stone-200 opacity-50 grayscale-[40%]'
                              }`}
                            >
                              <img
                                src={p.url}
                                alt="event"
                                className="w-full h-full object-cover"
                              />
                              <span
                                className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                                  isSelected
                                    ? 'bg-[#7A9D8C] text-white'
                                    : 'bg-black/50 text-white'
                                }`}
                              >
                                {isSelected ? (
                                  <Check size={11} strokeWidth={3} />
                                ) : (
                                  ''
                                )}
                              </span>
                              <span
                                className={`absolute bottom-0 inset-x-0 text-[8px] font-bold py-0.5 text-center ${
                                  isSelected
                                    ? 'bg-[#7A9D8C]/90 text-white'
                                    : 'bg-stone-800/75 text-stone-200'
                                }`}
                              >
                                {isSelected ? '🌐公開' : '🔒非公開'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* メモ共有の選択項目（デフォルトはOFF） */}
            <div className="mb-6 p-4 rounded-2xl border border-stone-200 bg-stone-50/90">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                    <FileText size={14} className="text-[#7A9D8C]" />
                    予定のメモ内容も一緒に共有する
                  </label>
                  <p className="text-[10px] text-stone-500 leading-relaxed">
                    予約番号や個人情報が含まれる場合があるため、
                    <strong>初期設定では「共有しない（非公開）」</strong>
                    になっています。
                    {eventsWithMemos.length > 0 &&
                      `（現在 ${eventsWithMemos.length}件の予定にメモがあります）`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShareMemos(!shareMemos)}
                  className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 flex items-center ${
                    shareMemos
                      ? 'bg-[#7A9D8C] justify-end'
                      : 'bg-stone-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-[11px] font-bold">
                <span className="text-stone-500">現在の設定：</span>
                {shareMemos ? (
                  <span className="text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    メモを公開する
                  </span>
                ) : (
                  <span className="text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={11} strokeWidth={3} />{' '}
                    メモは共有しない（推奨・安全）
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToConfirm}
              className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-md hover:bg-[#688a79] transition-all text-sm flex justify-center items-center gap-1.5"
            >
              <span>確認画面へ進む</span>
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-2.5">
              <AlertCircle
                size={18}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-0.5">公開前の最終チェック</p>
                <p className="text-[11px] text-amber-800">
                  以下の内容で「みんなの旅」に投稿されます。個人情報が含まれていないかご確認ください。
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 block mb-0.5">
                  タイトル / エリア
                </span>
                <p className="font-bold text-stone-800 text-sm">
                  {trip.title}{' '}
                  <span className="text-xs text-[#7A9D8C] ml-1">
                    （{region}・{trip.destination}）
                  </span>
                </p>
              </div>

              {description && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block mb-0.5">
                    旅の説明
                  </span>
                  <p className="text-stone-700 font-medium whitespace-pre-wrap bg-white p-2.5 rounded-xl border border-stone-100">
                    {description}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-stone-400 block mb-1">
                  公開するカバー写真 ({selectedImages.length}枚)
                </span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {selectedImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="cover"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-600">
                    公開される予定数
                  </span>
                  <span className="font-bold text-stone-800">
                    {(trip.events || []).length}件
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-600">
                    各予定内の写真
                  </span>
                  {selectedEventPhotoIds.length > 0 ? (
                    <span className="text-[11px] font-bold text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full">
                      選択した {selectedEventPhotoIds.length}枚 を公開
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-stone-500 bg-stone-200/70 px-2.5 py-0.5 rounded-full">
                      公開しない（0枚）
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-600">
                    持ち物リスト・出費メモ
                  </span>
                  <span className="text-[11px] font-bold text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full">
                    自動で非公開（除外）
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-600">
                    各予定のメモ内容
                  </span>
                  {shareMemos ? (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      公開する（{eventsWithMemos.length}件）
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full">
                      共有しない（非公開）
                    </span>
                  )}
                </div>
              </div>

              {shareMemos && eventsWithMemos.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5">
                  <p className="text-[10px] font-bold text-amber-700">
                    ▼ 公開されるメモの内容プレビュー
                  </p>
                  {eventsWithMemos.map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[11px] border-b border-stone-100 pb-1 last:border-none last:pb-0"
                    >
                      <span className="font-bold text-stone-700">
                        {ev.title}：
                      </span>
                      <span className="text-stone-600">{ev.memo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-stone-100 text-stone-600 font-bold rounded-2xl text-xs hover:bg-stone-200 transition-colors"
              >
                戻る（修正する）
              </button>
              <button
                type="button"
                onClick={handleFinalPublish}
                className="flex-[2] py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-md hover:bg-[#688a79] transition-all text-sm flex justify-center items-center gap-1.5"
              >
                <Share2 size={16} /> この内容で投稿する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// タイムライン内で予定を直接追加・差し込むフォーム
function InlineEventForm({
  onSave,
  onCancel,
  date,
  trip,
  currentUser,
  initialData,
}) {
  const [time, setTime] = useState(initialData?.time || '12:00');
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || 'sightseeing');
  const [location, setLocation] = useState(initialData?.location || '');
  const [cost, setCost] = useState(
    initialData?.cost ? String(initialData.cost) : ''
  );
  const [memo, setMemo] = useState(initialData?.memo || '');

  useEffect(() => {
    if (initialData) {
      if (initialData.time) setTime(initialData.time);
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.type) setType(initialData.type);
      if (initialData.location !== undefined) setLocation(initialData.location);
      if (initialData.cost !== undefined) setCost(String(initialData.cost));
      if (initialData.memo !== undefined) setMemo(initialData.memo);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedTag = QUICK_TAGS.find((t) => t.id === type) || QUICK_TAGS[2];
    const finalTitle = title.trim() || selectedTag.defaultTitle;
    onSave({
      id: generateId(),
      date,
      time: time || '12:00',
      title: finalTitle,
      type,
      location: location.trim(),
      cost: Number(cost) || 0,
      memo: memo.trim(),
      status: trip.isSoloTrip ? 'approved' : 'proposed',
      authorId: currentUser.id,
      photos: [],
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl shadow-md border-2 border-[#7A9D8C] space-y-3"
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-[#7A9D8C] flex items-center gap-1">
          <Plus size={14} /> 新しい予定を入力
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-600 p-1"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {QUICK_TAGS.map((tag) => {
          const TagIcon = tag.icon;
          const active = type === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setType(tag.id)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 border transition-all ${
                active
                  ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <TagIcon size={12} /> {tag.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">
            時間
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">
            予定のタイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: カフェでひと休み"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">
            場所・スポット名
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例: 嵐山カフェ"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">
            予算目安 (円)
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="例: 1500"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
      </div>

      {location.trim() && (
        <div className="flex justify-end">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location.trim()
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
          >
            <ExternalLink size={11} /> Googleマップで「{location.trim()}」を確認
          </a>
        </div>
      )}

      <div>
        <label className="text-[10px] font-bold text-stone-400 block mb-0.5">
          メモ（やりたいこと・持ち物など）
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows="2"
          placeholder="例: 人気の抹茶ラテを注文する"
          className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-[2] py-2.5 bg-[#7A9D8C] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#688a79] transition-colors"
        >
          {trip.isSoloTrip ? '予定を追加する' : '予定を提案する'}
        </button>
      </div>
    </form>
  );
}

// タイムライン内の単体スポットAI提案モーダル（Googleマップ確認リンク付き）
function EventAiSuggestModal({ trip, onClose, onSelect }) {
  const dest = trip.destination || '京都府';
  const [category, setCategory] = useState('カフェ・甘味処');
  const CATEGORIES = [
    'カフェ・甘味処',
    '絶景・写真スポット',
    'ご当地ランチ',
    'お土産・雑貨屋',
    '癒やし・足湯',
  ];

  const spotSuggestions = useMemo(() => {
    const SPOT_BY_AREA = {
      京都: {
        'カフェ・甘味処': [
          {
            title: '中村藤吉本店 宇治本店（生茶ゼリイ）',
            location: '中村藤吉本店',
            time: '14:30',
            cost: 1650,
            memo: '【★4.4 / レビュー4,200件超】安政元年創業の老舗茶商。竹筒に入った名物「生茶ゼリイ［抹茶］」は濃厚な抹茶の旨味と白玉が絶品。',
          },
          {
            title: 'ぎおん徳屋（本わらびもち）',
            location: 'ぎおん徳屋',
            time: '15:00',
            cost: 1500,
            memo: '【★4.4 / 食べログ百名店】注文ごとに練り上げるトロトロの本わらびもちが名物。花見小路近くで観光の合間に最適。',
          },
          {
            title: 'アラビカ京都 東山（% ARABICA）',
            location: 'アラビカ京都 東山',
            time: '13:30',
            cost: 700,
            memo: '【★4.3 / 八坂の塔すぐそば】世界的に人気のスペシャルティコーヒー専門店。濃厚なカフェラテ片手に東山散策が定番。',
          },
        ],
        '絶景・写真スポット': [
          {
            title: '伏見稲荷大社 千本鳥居',
            location: '伏見稲荷大社',
            time: '10:00',
            cost: 0,
            memo: '【★4.6 / 世界的人気の絶景】朱色の鳥居がどこまでも連なる幻想的な参道。四ツ辻まで登ると京都市街を一望できます。',
          },
          {
            title: '南禅寺 水路閣（レトロ赤レンガアーチ）',
            location: '南禅寺 水路閣',
            time: '14:00',
            cost: 0,
            memo: '【★4.5 / 明治の近代化遺産】境内に佇むローマ水道橋風のレンガアーチ。どこを切り取っても絵になるフォトスポット。',
          },
          {
            title: '法観寺 八坂の塔（東山通り）',
            location: '法観寺 八坂の塔',
            time: '16:30',
            cost: 0,
            memo: '【★4.4 / 京都らしい風情No.1】石畳の坂道の先に五重塔がそびえる定番アングル。夕暮れ時のマジックアワーが特に美しい。',
          },
        ],
        ご当地ランチ: [
          {
            title: '南禅寺 順正（名物・京ゆどうふ）',
            location: '南禅寺 順正',
            time: '12:00',
            cost: 3500,
            memo: '【★4.3 / 登録有形文化財の庭園】美しい回遊式庭園を眺めながら、滑らかな京ゆどうふや田楽を味わえる老舗名店。',
          },
          {
            title: '山元麺蔵（手打ち京うどん・土ゴボウ天）',
            location: '山元麺蔵',
            time: '12:30',
            cost: 1600,
            memo: '【★4.5 / 京都屈指の行列店】力強いコシと喉越しの手打ちうどんに、香ばしい土ゴボウ天ぷらが相性抜群。',
          },
          {
            title: '先斗町 柚子元（名物・柚子鍋＆餃子）',
            location: '先斗町 柚子元',
            time: '12:30',
            cost: 2200,
            memo: '【★4.2 / 爽やかな柚子の香り】風情ある先斗町の人気店。香り高い柚子スープの麺類や名物餃子が口コミで評判。',
          },
        ],
        'お土産・雑貨屋': [
          {
            title: '錦市場商店街（京の台所食べ歩き＆お土産）',
            location: '錦市場',
            time: '11:30',
            cost: 2000,
            memo: '【★4.3 / 約400mのアーケード】京漬物、だし巻き卵、豆乳ドーナツなど京都の味覚と手土産が一度に揃う名所。',
          },
          {
            title: 'よーじや 祇園本店（あぶらとり紙・限定コスメ）',
            location: 'よーじや 祇園本店',
            time: '15:30',
            cost: 1500,
            memo: '【★4.2 / 京都土産の定番】定番のあぶらとり紙はもちろん、まゆごもりシリーズのハンドクリームや限定雑貨が人気。',
          },
        ],
        '癒やし・足湯': [
          {
            title: '嵐山駅 駅の足湯（天然温泉＆京友禅の光林）',
            location: '嵐山駅はんなり・ほっこりスクエア',
            time: '15:30',
            cost: 300,
            memo: '【★4.3 / オリジナルタオル付き】歩き疲れた足を嵐山温泉の足湯でリフレッシュ。駅構内の「キモノフォレスト」も必見。',
          },
          {
            title: '京都嵐山温泉 風風の湯（日帰り天然温泉）',
            location: '京都嵐山温泉 風風の湯',
            time: '16:30',
            cost: 1300,
            memo: '【★4.1 / 渡月橋すぐそば】露天風呂やサウナを備えた日帰り温泉施設。観光の締めくくりにさっぱり汗を流せます。',
          },
        ],
      },
    };

    const areaKey = Object.keys(SPOT_BY_AREA).find((k) => dest.includes(k));
    if (areaKey && SPOT_BY_AREA[areaKey][category]) {
      return SPOT_BY_AREA[areaKey][category].map((item) => ({
        ...item,
        type:
          category.includes('ランチ') || category.includes('カフェ')
            ? 'meal'
            : category.includes('癒やし')
            ? 'active'
            : 'sightseeing',
      }));
    }

    const cleanDest = dest.replace(/[都道府県]$/, '') || '現地';
    return [
      {
        title: `${cleanDest}エリア 高評価${category}（口コミ★4.4人気店）`,
        location: `${cleanDest} ${category.split('・')[0]} 人気店`,
        type:
          category.includes('ランチ') || category.includes('カフェ')
            ? 'meal'
            : 'sightseeing',
        time: '13:30',
        cost: 1800,
        memo: `【★4.4 / 地元で評判の名店】${dest}ならではの旬の素材やロケーションが楽しめる人気${category}スポット。`,
      },
      {
        title: `${cleanDest} 老舗・隠れ家${category.split('・')[0]}`,
        location: `${cleanDest} 老舗 ${category.split('・')[0]}`,
        type:
          category.includes('ランチ') || category.includes('カフェ')
            ? 'meal'
            : 'sightseeing',
        time: '15:00',
        cost: 1500,
        memo: `【★4.3 / 落ち着いた空間】観光の合間にゆっくり休憩できるとレビューで高評価の隠れ家スポット。`,
      },
      {
        title: `${cleanDest} 定番の${category}名所`,
        location: `${cleanDest} 観光 ${category.split('・')[0]}`,
        type: category.includes('癒やし') ? 'active' : 'sightseeing',
        time: '11:30',
        cost: 2200,
        memo: `【★4.5 / 初めてならここ】写真映えする看板メニューや景色が揃う${dest}の定番スポット。`,
      },
    ];
  }, [dest, category]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[250] flex justify-center items-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base text-stone-800 flex items-center gap-1.5">
            <Sparkles size={18} className="text-amber-500" />{' '}
            AIおすすめスポット提案 ({dest})
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-3">
          気になるジャンルを選ぶと、Googleマップで場所を確認しながら予定に追加できます。
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                category === c
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {spotSuggestions.map((spot, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-xs text-stone-800">
                    {spot.title}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-bold mt-0.5 flex items-center gap-1">
                    <MapPin size={10} className="text-red-500" />{' '}
                    {spot.location} / 目安 ¥{spot.cost.toLocaleString()}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    spot.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <ExternalLink size={11} /> マップで確認
                </a>
              </div>
              <p className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-100">
                {spot.memo}
              </p>
              <button
                type="button"
                onClick={() => onSelect(spot)}
                className="w-full py-2 bg-[#7A9D8C] text-white font-bold rounded-xl text-xs hover:bg-[#688a79] transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={14} /> この予定を追加フォームに反映
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// タイムラインの各予定カード (EventCard)
// ------------------------------------------
function EventCard({
  event,
  trip,
  isReadOnly,
  currentUser,
  onApprove,
  onUpdateMemo,
  onDelete,
  onCopy,
  onAddPhoto,
  onTogglePhotoPublic,
  onRequestDeletePhoto,
  canDeletePhoto,
  onEnlargeImage,
}) {
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoText, setMemoText] = useState(event.memo || '');
  const photoInputRef = useRef(null);

  useEffect(() => {
    setMemoText(event.memo || '');
  }, [event.memo]);

  const tagInfo = QUICK_TAGS.find((t) => t.id === event.type) || QUICK_TAGS[2];
  const TagIcon = tagInfo.icon;
  const author = (trip.members || []).find((m) => m.id === event.authorId) || {
    name: trip.authorName || currentUser?.name || 'メンバー',
    color: '#7A9D8C',
    avatar: trip.authorAvatar || currentUser?.avatar,
  };
  const isProposed =
    event.status === 'proposed' && !trip.isSoloTrip && !isReadOnly;

  const handleSaveMemo = () => {
    if (onUpdateMemo) onUpdateMemo(memoText.trim());
    setIsEditingMemo(false);
    customAlert('メモを保存しました');
  };

  const handleOpenNavigation = () => {
    const dest = encodeURIComponent(event.location || event.title);
    const originStation = currentUser?.station
      ? encodeURIComponent(currentUser.station)
      : '';
    const navUrl = originStation
      ? `https://www.google.com/maps/dir/?api=1&destination=${dest}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    window.open(navUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pl-6 relative group">
      {/* タイムライン左側の丸アイコン */}
      <div
        className={`absolute -left-[13px] top-3 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs border-2 border-white ${
          isProposed ? 'bg-amber-400' : 'bg-[#7A9D8C]'
        }`}
      >
        <TagIcon size={12} />
      </div>

      <div
        className={`bg-white p-4 rounded-3xl shadow-xs border transition-all ${
          isProposed ? 'border-amber-300 bg-amber-50/20' : 'border-stone-100'
        }`}
      >
        {isProposed && (
          <div className="mb-2.5 flex items-center justify-between bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
              💡 提案中の予定（みんなの確認待ち）
            </span>
            <button
              type="button"
              onClick={onApprove}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Check size={11} strokeWidth={3} /> 承認して確定
            </button>
          </div>
        )}

        {/* 上段：時間・メモ開閉ボタン・削除/コピー・作成者 */}
        <div className="flex justify-between items-center gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-500">
            <Clock size={13} className="text-[#7A9D8C]" />
            <span>{event.time || '未定'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(!isReadOnly || event.memo) && (
              <button
                type="button"
                onClick={() => {
                  const nextOpen = !isMemoOpen;
                  setIsMemoOpen(nextOpen);
                  if (nextOpen && !event.memo && !isReadOnly) {
                    setIsEditingMemo(true);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-colors ${
                  isMemoOpen || event.memo
                    ? 'bg-[#7A9D8C]/10 text-[#557465] border-[#7A9D8C]/30'
                    : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <FileText size={11} />
                <span>
                  {event.memo ? `メモ ${isMemoOpen ? '▲' : '▼'}` : '+ メモ'}
                </span>
              </button>
            )}

            {isReadOnly ? (
              <button
                type="button"
                onClick={onCopy}
                className="px-2.5 py-1 bg-[#7A9D8C]/10 hover:bg-[#7A9D8C]/20 text-[#557465] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="この予定をコピー"
              >
                <Copy size={11} /> コピー
              </button>
            ) : (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="予定を削除"
              >
                <Trash2 size={14} />
              </button>
            )}

            <div className="flex items-center gap-1 pl-1 border-l border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 max-w-[72px] truncate">
                {author.name}
              </span>
              <UserAvatar user={author} size="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* タイトル */}
        <h4 className="font-bold text-sm text-stone-800 leading-snug mb-2">
          {event.title}
        </h4>

        {/* 金額・場所バッジ */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {Number(event.cost) > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg">
              <Banknote size={12} className="text-[#7A9D8C]" /> ¥
              {Number(event.cost).toLocaleString()}
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg">
              <MapPin size={12} className="text-red-500" /> {event.location}
            </span>
          )}
        </div>

        {/* マップ確認＆ナビ起動ボタン */}
        {(event.location || event.title) && (
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                event.location || event.title
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink size={12} /> マップで確認
            </a>
            <button
              type="button"
              onClick={handleOpenNavigation}
              className="py-2 px-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 border border-blue-200/80 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation size={12} /> ナビを起動
            </button>
          </div>
        )}

        {/* 開閉式メモ欄 */}
        {isMemoOpen && (
          <div className="mt-2.5 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs animate-in fade-in">
            {isEditingMemo && !isReadOnly ? (
              <div className="space-y-2">
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  rows="2"
                  placeholder="予約番号やメモを入力..."
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMemoText(event.memo || '');
                      setIsEditingMemo(false);
                      if (!event.memo) setIsMemoOpen(false);
                    }}
                    className="px-3 py-1 bg-stone-200/70 text-stone-600 rounded-lg text-[10px] font-bold hover:bg-stone-200"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMemo}
                    className="px-3 py-1 bg-[#7A9D8C] text-white rounded-lg text-[10px] font-bold hover:bg-[#688a79]"
                  >
                    保存する
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-2">
                <p className="text-stone-700 font-medium whitespace-pre-wrap leading-relaxed flex-1">
                  {event.memo || 'メモはありません'}
                </p>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setIsEditingMemo(true)}
                    className="text-[10px] font-bold text-[#7A9D8C] hover:underline shrink-0 flex items-center gap-0.5"
                  >
                    <Edit2 size={11} /> 編集
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 予定ごとの思い出写真（自分のしおりでは追加＆公開/非公開の切替が可能、みんなの旅では公開設定された写真を表示） */}
        {(!isReadOnly ||
          (Array.isArray(event.photos) && event.photos.length > 0)) && (
          <div className="mt-2.5 pt-2.5 border-t border-stone-100">
            {Array.isArray(event.photos) && event.photos.length > 0 && (
              <div
                data-no-swipe="true"
                style={{ touchAction: 'pan-x pan-y' }}
                className="flex gap-2.5 overflow-x-auto no-scrollbar mb-2 pb-0.5"
              >
                {event.photos.map((p) => {
                  const isMine = canDeletePhoto
                    ? canDeletePhoto(p)
                    : !p.authorId || p.authorId === currentUser?.id;
                  const isPublicPhoto = p.isPublic !== false;
                  return (
                    <div
                      key={p.id}
                      className={`${
                        isReadOnly ? 'w-28 h-28' : 'w-20 h-20'
                      } relative rounded-2xl overflow-hidden border border-stone-200 shrink-0 group/photo shadow-2xs bg-stone-100`}
                    >
                      <img
                        src={p.url}
                        alt="memory"
                        onClick={() => onEnlargeImage && onEnlargeImage(p.url)}
                        className="w-full h-full object-cover cursor-pointer group-hover/photo:scale-105 transition-transform duration-300"
                      />

                      {/* 自分のしおりの場合：左上に「🌐公開OK / 🔒非公開」の切り替えボタンを表示 */}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTogglePhotoPublic) onTogglePhotoPublic(p.id);
                          }}
                          className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-extrabold shadow-xs transition-colors flex items-center gap-0.5 ${
                            isPublicPhoto
                              ? 'bg-[#7A9D8C]/95 text-white'
                              : 'bg-stone-800/80 text-stone-200'
                          }`}
                          title="みんなの旅に公開するときにこの写真を含めるか切り替え"
                        >
                          <span>{isPublicPhoto ? '🌐公開可' : '🔒非公開'}</span>
                        </button>
                      )}

                      {p.authorName && (
                        <span className="absolute bottom-0.5 left-0.5 right-0.5 bg-black/55 text-white text-[8px] font-bold px-1 py-0.2 rounded truncate text-center pointer-events-none">
                          📷 {p.authorName}
                        </span>
                      )}

                      {!isReadOnly && isMine && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onRequestDeletePhoto) onRequestDeletePhoto(p);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          title="自分の写真を削除"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadOnly && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/80 rounded-xl text-[10px] font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Camera size={12} className="text-[#7A9D8C]" />{' '}
                  思い出の写真を貼る
                </button>
                {Array.isArray(event.photos) && event.photos.length > 0 && (
                  <span className="text-[9px] font-bold text-stone-400">
                    ※写真の「🌐公開可 / 🔒非公開」をタップで切替可能
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0] && onAddPhoto) {
                      onAddPhoto(URL.createObjectURL(e.target.files[0]));
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// 公開しおりのコメント画面 (CommentView)
// ------------------------------------------
function CommentView({ trip, currentUser, onAddComment }) {
  const [text, setText] = useState('');
  const comments = Array.isArray(trip.comments) ? trip.comments : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (onAddComment) onAddComment(trip.id, text.trim());
    setText('');
  };

  return (
    <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
        <h3 className="font-bold text-sm text-stone-800 mb-3 flex items-center gap-1.5">
          <MessageSquare size={16} className="text-[#7A9D8C]" />{' '}
          この旅へのコメント ({comments.length})
        </h3>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              currentUser?.isGuest
                ? 'コメントするにはアカウント登録が必要です'
                : '感想や質問をコメントする...'
            }
            disabled={currentUser?.isGuest}
            className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!text.trim() || currentUser?.isGuest}
            className="px-4 py-3 bg-[#7A9D8C] text-white font-bold rounded-xl text-xs shadow-xs hover:bg-[#688a79] disabled:opacity-40 transition-colors shrink-0"
          >
            送信
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-xs text-stone-400 font-bold text-center py-8">
            まだコメントはありません。最初のコメントを送ってみましょう！
          </p>
        ) : (
          <div className="space-y-3 divide-y divide-stone-100">
            {comments.map((c) => (
              <div
                key={c.id}
                className="pt-3 first:pt-0 flex items-start gap-2.5"
              >
                <img
                  src={c.authorAvatar || FEMALE_AVATARS[0]}
                  alt={c.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-800">
                      {c.authorName}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// 思い出写真アルバム画面 (AlbumView)
// ------------------------------------------
function AlbumView({
  trip,
  currentUser,
  updateTrip,
  isReadOnly,
  onEnlargeImage,
}) {
  const fileInputRef = useRef(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const photos = Array.isArray(trip.photos) ? trip.photos : [];

  // 投稿した本人かどうか判定するヘルパー
  const isMyPhoto = (photo) => {
    if (!photo || !currentUser) return false;
    if (photo.authorId) return photo.authorId === currentUser.id;
    if (photo.authorName) {
      return (
        photo.authorName === currentUser.name ||
        currentUser.name.startsWith(photo.authorName) ||
        photo.authorName.startsWith(currentUser.name)
      );
    }
    return true;
  };

  const handleUpload = (e) => {
    if (e.target.files && !isReadOnly) {
      const added = Array.from(e.target.files).map((file) => ({
        id: generateId(),
        url: URL.createObjectURL(file),
        authorId: currentUser?.id,
        authorName: currentUser?.name || 'メンバー',
        createdAt: getTodayString(),
      }));
      updateTrip({ ...trip, photos: [...added, ...photos] });
      customAlert(`${added.length}枚の写真を追加しました！`);
      e.target.value = '';
    }
  };

  const handleConfirmDeletePhoto = () => {
    if (isReadOnly || !photoToDelete) return;
    if (!isMyPhoto(photoToDelete)) {
      customAlert('他のメンバーが投稿した写真は削除できません');
      setPhotoToDelete(null);
      return;
    }
    const photoId = photoToDelete.id;
    updateTrip({
      ...trip,
      photos: photos.filter((p) => p.id !== photoId),
      events: (trip.events || []).map((ev) => ({
        ...ev,
        photos: (ev.photos || []).filter((p) => p.id !== photoId),
      })),
    });
    setPhotoToDelete(null);
    customAlert('思い出写真を削除しました');
  };

  return (
    <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-stone-800 flex items-center gap-1.5">
            <ImageIcon size={16} className="text-[#7A9D8C]" />{' '}
            旅の思い出アルバム ({photos.length}枚)
          </h3>
          <p className="text-[11px] text-stone-400 font-bold mt-0.5">
            写真は全員に共有されます（削除は投稿した本人のみ可能）
          </p>
        </div>
        {!isReadOnly && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-[#7A9D8C] text-white font-bold rounded-xl text-xs shadow-xs hover:bg-[#688a79] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} /> 写真を追加
            </button>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200">
          <Camera size={32} className="text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-stone-500 mb-1">
            まだ思い出の写真がありません
          </p>
          <p className="text-[11px] text-stone-400">
            右上の「写真を追加」または各予定の「思い出の写真を貼る」から追加できます
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => {
            const isMine = isMyPhoto(photo);
            return (
              <div
                key={photo.id}
                className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs group"
              >
                <img
                  src={photo.url}
                  alt="album"
                  onClick={() => onEnlargeImage && onEnlargeImage(photo.url)}
                  className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                />
                {photo.authorName && (
                  <div className="absolute bottom-2 left-2 bg-black/55 backdrop-blur-2xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                    <span>📷 {photo.authorName}</span>
                  </div>
                )}
                {!isReadOnly && isMine && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(photo);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm"
                    title="自分が投稿した写真を削除"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* アルバム写真の削除確認モーダル */}
      {photoToDelete && (
        <div
          className="fixed inset-0 bg-black/60 z-[270] flex justify-center items-center p-4 animate-in fade-in"
          onClick={() => setPhotoToDelete(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">
              思い出の写真を削除しますか？
            </h3>
            <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-3 border border-stone-200 shadow-xs bg-stone-100">
              <img
                src={photoToDelete.url}
                alt="削除対象の写真"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mb-5">
              削除した写真はアルバムから消去され、元に戻せません。本当によろしいですか？
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePhoto}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} /> 削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TabitabiApp />
    </ErrorBoundary>
  );
}
