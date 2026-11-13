import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
import { 
  Menu, X, Globe, MapPin, Calendar, Clock, Camera, Plus, 
  Map as MapIcon, Image as ImageIcon, Check, Share2, Compass, 
  Utensils, Car, Bed, Info, Banknote, LogOut,
  Search, Heart, ExternalLink, User, Trash2, CheckCircle2, ChevronRight, AlertCircle,
  Activity, Copy, Edit, Edit2, Sparkles, ChevronLeft, Bell, FileText,
  MoreVertical, MessageCircle, Navigation, Flag, MessageSquare, XCircle
} from 'lucide-react';

// --- エラー復旧用の境界（ErrorBoundary） ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("App crashed:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-center text-white">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">画面の読み込みエラーが発生しました</h2>
          <p className="text-sm text-stone-400 mb-6">古いデータとの不整合が起きている可能性があります。<br/>下のボタンを押してデータをリセットしてください。</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">データをリセットして最初から始める</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Theme & Constants ---
// ★ フェーズ切り替えスイッチ：
// false = フェーズ1（届出不要・運営厳選の公式モデルコース紹介＋招待コードによる仲間内共有モード）
// true  = フェーズ2（フルSNS開放：みんなの旅への一般投稿・フォロー・コメント・通報機能をすべて表示）
const ENABLE_PUBLIC_SNS_FEATURES = false;

// ★ SNSアップデート予告バナーの表示スイッチ（後でバナーだけ消したい時は false にするだけ）
const SHOW_SNS_COMING_SOON_BANNER = true;

// ★ アプリをアップデート（再ビルド）せずに「みんなの旅」の公式おすすめコースを更新するための外部JSON URL
// Googleスプレッドシート（Apps Script）や GitHub Gist / microCMS / Supabase 等の公開JSON URLを設定すると、
// アプリ起動時＆下に引っ張って更新した時に自動で最新の公式投稿一覧を読み込みます（空欄の場合はアプリ内の初期データを表示）
const OFFICIAL_FEED_REMOTE_URL = '';

// ★ 公式アカウントの表示プロフィール定義（フェーズ1のときにすべての投稿者表示に適用）
const OFFICIAL_ACCOUNT_PROFILE = {
  id: 'tabitabi_official',
  name: 'たびたび公式ガイド',
  handle: '@tabitabi_official',
  roleLabel: 'たびたび編集部・公式モデルコース',
  bio: 'たびたび編集部が厳選した全国の王道・穴場モデルコースをお届けします✈️ 気になるプランは「コピーして使う」から自分たちのしおりにそのまま取り込めます！'
};

const PRESET_COLORS = ['#7A9D8C', '#E2A98B', '#8FA8C8', '#D4B886', '#B0A3D4'];
const REGIONS = ['北海道・東北', '関東', '中部', '関西', '中国・四国', '九州・沖縄'];
const PREFECTURES = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];

const FEMALE_AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Mimi&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Hana&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Rin&backgroundColor=eaf0ed'
];
const MALE_AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Max&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Sam&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Ken&backgroundColor=eaf0ed',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Ren&backgroundColor=eaf0ed'
];

const MOCK_STATIONS = [
  { name: '東京駅 (JR山手線など)', yomi: 'とうきょう トウキョウ tokyo', city: '千代田区' },
  { name: '新宿駅 (JR山手線など)', yomi: 'しんじゅく シンジュク shinjuku', city: '新宿区' },
  { name: '渋谷駅 (JR山手線など)', yomi: 'しぶや シブヤ shibuya', city: '渋谷区' },
  { name: '池袋駅 (JR山手線など)', yomi: 'いけぶくろ イケブクロ ikebukuro', city: '豊島区' },
  { name: '恵比寿駅 (JR山手線など)', yomi: 'えびす エビス ebisu', city: '渋谷区' },
  { name: '品川駅 (JR山手線など)', yomi: 'しながわ シナガワ shinagawa', city: '港区' },
  { name: '上野駅 (JR山手線など)', yomi: 'うえの ウエノ ueno', city: '台東区' },
  { name: '横浜駅 (JR東海道本線など)', yomi: 'よこはま ヨコハマ yokohama', city: '横浜市' },
  { name: '名古屋駅 (JR東海道新幹線など)', yomi: 'なごや ナゴヤ nagoya', city: '名古屋市' },
  { name: '京都駅 (JR東海道本線など)', yomi: 'きょうと キョウト kyoto', city: '京都市' },
  { name: '大阪駅 (JR大阪環状線など)', yomi: 'おおさか オオサカ osaka', city: '大阪市' },
  { name: '梅田駅 (阪急線など)', yomi: 'うめだ ウメダ umeda', city: '大阪市' },
  { name: '難波駅 (南海線など)', yomi: 'なんば ナンバ nanba namba', city: '大阪市' },
  { name: '博多駅 (JR鹿児島本線など)', yomi: 'はかた ハカタ hakata', city: '福岡市' },
  { name: '札幌駅 (JR函館本線など)', yomi: 'さっぽろ サッポロ sapporo', city: '札幌市' },
  { name: '松本駅 (JR篠ノ井線など)', yomi: 'まつもと マツモト matsumoto', city: '松本市' },
  { name: '島内駅 (JR大糸線)', yomi: 'しまうち シマウチ shimauchi', city: '松本市' }
];

const QUICK_TAGS = [
  { id: 'transport', label: '移動', icon: Car, defaultTitle: '車・電車移動' },
  { id: 'meal', label: 'ごはん', icon: Utensils, defaultTitle: 'ランチ・ディナー' },
  { id: 'sightseeing', label: '観光', icon: Camera, defaultTitle: '観光スポット巡り' },
  { id: 'active', label: '体験', icon: Activity, defaultTitle: '体験・アクティビティ' },
  { id: 'hotel', label: '宿', icon: Bed, defaultTitle: 'ホテルチェックイン' },
];

// ★ 目的地までの移動手段＆移動重視ポイント（コスパ・速さ・体験）の選択肢
const TRANSPORT_METHODS = [
  { id: 'shinkansen_train', label: '🚆 新幹線・電車', short: '新幹線・電車' },
  { id: 'car', label: '🚗 車・レンタカー', short: '車・ドライブ' },
  { id: 'flight', label: '✈️ 飛行機', short: '飛行機' },
  { id: 'highway_bus', label: '🚌 高速バス・夜行バス', short: '高速バス' },
  { id: 'ferry', label: '⛴️ フェリー・船', short: 'フェリー・船' }
];

const TRANSPORT_PRIORITIES = [
  { id: 'cost', label: '💰 コスパ重視', desc: '早割・バス・在来線や乗り放題パスを活用して交通費を抑える' },
  { id: 'speed', label: '⚡ 速さ・快適さ重視', desc: '新幹線・特急・飛行機・タクシーで移動時間を最短にする' },
  { id: 'experience', label: '🌟 体験・景色重視', desc: '観光列車・絶景ドライブ・フェリーなど移動自体を旅の思い出にする' }
];

const BUDGET_TIER_OPTIONS = [
  { id: '節約・コスパ (〜2万円)', label: '💰 〜2万円', amount: 20000 },
  { id: '標準 (3〜5万円)', label: '💴 3〜5万円', amount: 40000 },
  { id: 'ちょっと贅沢 (5〜8万円)', label: '✨ 5〜8万円', amount: 65000 },
  { id: 'ラグジュアリー (10万円〜)', label: '💎 10万円〜', amount: 120000 }
];

// ★ よく使う出発地点（自宅駅以外のお気に入り出発地）を保存・取得するヘルパー
const getSavedDeparturePoints = (user) => {
  const saved = safeParse('tabitabi_saved_departures', []);
  const homePoint = user?.station
    ? `${user.station}（自宅・最寄り駅）`
    : user?.residence && user.residence !== '未設定'
    ? `${user.residence}${user.city || ''}（自宅）`
    : '松本駅（自宅・最寄り駅）';
  const defaults = [homePoint, '東京駅', '新宿駅', '羽田空港', '名古屋駅', '京都駅', '新大阪駅', '博多駅'];
  return Array.from(new Set([homePoint, ...saved, ...defaults]));
};

const addSavedDeparturePoint = (pointStr) => {
  const clean = (pointStr || '').trim();
  if (!clean) return;
  try {
    const saved = safeParse('tabitabi_saved_departures', []);
    const next = Array.from(new Set([clean, ...saved])).slice(0, 15);
    localStorage.setItem('tabitabi_saved_departures', JSON.stringify(next));
  } catch (e) {}
};

// ★ モーダル・ポップアップ表示中に背景のスクロールや揺れを完全にロックするカスタムフック
function useLockBodyScroll(isLocked = true) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [isLocked]);
}

const EXTRA_PUBLIC_TRIP_TEMPLATES = [
  {
    title: '金沢・ひがし茶屋街と海鮮づくしの旅',
    description: '近江町市場で朝ごはんを食べて、兼六園や21世紀美術館を巡った実録1泊2日プラン！',
    destination: '石川県',
    region: '中部',
    startDate: '2025-10-18',
    endDate: '2025-10-19',
    authorId: 'm4',
    authorName: '北陸さんぽ',
    authorAvatar: FEMALE_AVATARS[3],
    authorBio: '北陸の美味しい海鮮と和菓子を探して旅しています🍣',
    covers: ['https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80'],
    events: [
      { id: 'ex_k1', date: '2025-10-18', time: '10:30', title: '近江町市場でのどぐろ・海鮮丼ランチ', type: 'meal', cost: 3500, status: 'approved', authorId: 'm4', location: '近江町市場', photos: [{ id: 'pex_k1', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', authorId: 'm4', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'ex_k2', date: '2025-10-18', time: '13:00', title: '兼六園＆金沢城公園 散策', type: 'sightseeing', cost: 800, status: 'approved', authorId: 'm4', location: '兼六園', photos: [] },
      { id: 'ex_k3', date: '2025-10-18', time: '15:00', title: 'ひがし茶屋街で金箔ソフト＆和カフェ', type: 'meal', cost: 1600, status: 'approved', authorId: 'm4', location: 'ひがし茶屋街', photos: [{ id: 'pex_k3', url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80', authorId: 'm4', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'ex_k4', date: '2025-10-18', time: '18:00', title: '金沢町家ホテル宿泊', type: 'hotel', cost: 14000, status: 'approved', authorId: 'm4', location: '金沢駅周辺', photos: [] },
      { id: 'ex_k5', date: '2025-10-19', time: '10:30', title: '金沢21世紀美術館 鑑賞', type: 'sightseeing', cost: 1200, status: 'approved', authorId: 'm4', location: '金沢21世紀美術館', photos: [] }
    ]
  },
  {
    title: '沖縄・宮古ブルーに癒やされる南国ドライブ',
    description: '伊良部大橋を渡って絶景ビーチ巡り！実際に行って感動したマンゴースイーツも紹介。',
    destination: '沖縄県',
    region: '九州・沖縄',
    startDate: '2025-07-12',
    endDate: '2025-07-13',
    authorId: 'm5',
    authorName: 'ちゅら旅',
    authorAvatar: MALE_AVATARS[2],
    authorBio: '離島と青い海が大好き！年に3回は沖縄に行きます🌺',
    covers: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    events: [
      { id: 'ex_o1', date: '2025-07-12', time: '11:00', title: '宮古空港でレンタカー出発＆伊良部大橋ドライブ', type: 'transport', cost: 4500, status: 'approved', authorId: 'm5', location: '伊良部大橋', photos: [] },
      { id: 'ex_o2', date: '2025-07-12', time: '12:30', title: '宮古そば＆ソーキそばランチ', type: 'meal', cost: 1100, status: 'approved', authorId: 'm5', location: '古謝そば屋', photos: [] },
      { id: 'ex_o3', date: '2025-07-12', time: '14:30', title: '与那覇前浜ビーチ＆ウミガメシュノーケル体験', type: 'active', cost: 6500, status: 'approved', authorId: 'm5', location: '与那覇前浜ビーチ', photos: [{ id: 'pex_o3', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', authorId: 'm5', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'ex_o4', date: '2025-07-12', time: '18:00', title: 'オーシャンビューリゾートホテル宿泊', type: 'hotel', cost: 18000, status: 'approved', authorId: 'm5', location: '宮古島', photos: [] },
      { id: 'ex_o5', date: '2025-07-13', time: '13:00', title: '完熟マンゴーパフェ＆南国カフェ', type: 'meal', cost: 1800, status: 'approved', authorId: 'm5', location: 'ユートピアファーム宮古島', photos: [] }
    ]
  },
  {
    title: '広島・尾道レトロ坂道＆しまなみ海道サイクリング',
    description: '瀬戸内海の島々を自転車で駆け抜けた爽快旅！尾道ラーメンも堪能しました。',
    destination: '広島県',
    region: '中国・四国',
    startDate: '2025-05-17',
    endDate: '2025-05-18',
    authorId: 'm6',
    authorName: 'せとうちライダー',
    authorAvatar: MALE_AVATARS[3],
    authorBio: '自転車と一緒に全国の海沿いを走っています🚲',
    covers: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'],
    events: [
      { id: 'ex_h1', date: '2025-05-17', time: '10:00', title: '尾道駅前でレンタサイクル貸出', type: 'active', cost: 3000, status: 'approved', authorId: 'm6', location: '尾道駅', photos: [] },
      { id: 'ex_h2', date: '2025-05-17', time: '12:00', title: '本場の尾道ラーメンランチ', type: 'meal', cost: 950, status: 'approved', authorId: 'm6', location: '尾道商店街', photos: [] },
      { id: 'ex_h3', date: '2025-05-17', time: '14:00', title: '千光寺山ロープウェイ＆猫の細道散策', type: 'sightseeing', cost: 700, status: 'approved', authorId: 'm6', location: '千光寺', photos: [{ id: 'pex_h3', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', authorId: 'm6', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'ex_h4', date: '2025-05-17', time: '17:30', title: '瀬戸内海ビューのサイクリスト向けホテル宿泊', type: 'hotel', cost: 12000, status: 'approved', authorId: 'm6', location: 'ONOMICHI U2', photos: [] }
    ]
  },
  {
    title: '軽井沢・森のカフェとアウトレット週末旅',
    description: '東京から新幹線で1時間！緑に囲まれたテラス席でモーニングを楽しんだ大人の休日。',
    destination: '長野県',
    region: '中部',
    startDate: '2025-08-23',
    endDate: '2025-08-24',
    authorId: 'm7',
    authorName: '高原カフェ部',
    authorAvatar: FEMALE_AVATARS[4],
    authorBio: '信州のカフェとパン屋さん巡りが趣味です🥐',
    covers: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'],
    events: [
      { id: 'ex_ka1', date: '2025-08-23', time: '09:30', title: 'ベーカリー＆レストラン沢村で高原モーニング', type: 'meal', cost: 2200, status: 'approved', authorId: 'm7', location: 'ベーカリー＆レストラン沢村 旧軽井沢', photos: [{ id: 'pex_ka1', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', authorId: 'm7', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'ex_ka2', date: '2025-08-23', time: '11:30', title: '白糸の滝＆旧軽井沢銀座通り食べ歩き', type: 'sightseeing', cost: 1500, status: 'approved', authorId: 'm7', location: '旧軽井沢銀座通り', photos: [] },
      { id: 'ex_ka3', date: '2025-08-23', time: '14:30', title: 'ハルニレテラスで丸山珈琲＆川辺散策', type: 'meal', cost: 1400, status: 'approved', authorId: 'm7', location: 'ハルニレテラス', photos: [] },
      { id: 'ex_ka4', date: '2025-08-23', time: '17:00', title: '軽井沢の森リゾートホテル宿泊', type: 'hotel', cost: 16500, status: 'approved', authorId: 'm7', location: '軽井沢', photos: [] }
    ]
  }
];

const initialPublicTrips = [
  {
    id: 'PUB-1',
    title: '【京都】王道と穴場を巡る！秋の紅葉ライトアップ＆保津川下り1泊2日',
    description: '昨年11月に実地取材して大満足だった京都コース！南禅寺の湯豆腐ランチから永観堂の紅葉ライトアップ、翌日は保津川下りと嵐山食べ歩きまで無駄なく回れました。',
    destination: '京都府', region: '関西', authorId: 'm1', authorName: 'アクティブ夫婦', authorAvatar: FEMALE_AVATARS[0],
    authorBio: '週末は全国の絶景とアクティビティを求めて夫婦で旅しています！',
    likes: 482, views: 2420, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-11-15', endDate: '2025-11-16', budget: 33900, publishedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm1', name: 'アクティブ夫婦', color: '#8FA8C8' }],
    comments: [{ id: 'c1', text: '時間配分が完璧でそのまま真似しました！', authorName: 'たびたろう', authorAvatar: MALE_AVATARS[1], createdAt: Date.now() - 86400000 }],
    events: [
      { id: 'e1', date: '2025-11-15', time: '10:00', title: 'JR京都駅到着・手荷物配送（キャリーサービス）手続き', type: 'transport', cost: 1500, status: 'approved', authorId: 'm1', location: '京都駅', memo: '京都駅地下のキャリーサービスで宿へ荷物を送ると手ぶらで観光開始できます。地下鉄・バス1日券（1,100円）も購入。', photos: [] },
      { id: 'e2', date: '2025-11-15', time: '11:30', title: '南禅寺 順正（登録有形文化財の庭園で湯豆腐ランチ）', type: 'meal', cost: 3500, status: 'approved', authorId: 'm1', location: '南禅寺 順正', memo: '名物の「ゆどうふ花コース」。食後はすぐ隣の南禅寺・水路閣（赤レンガアーチ）で記念撮影！', photos: [{ id: 'pe_1', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', authorId: 'm1', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e3', date: '2025-11-15', time: '14:00', title: '哲学の道さんぽ＆ぎおん徳屋で本わらびもち', type: 'meal', cost: 1500, status: 'approved', authorId: 'm1', location: 'ぎおん徳屋', memo: 'お箸で持ち上げるととろける本わらびもち。きな粉と黒蜜が絶品でした。', photos: [{ id: 'pe_1b', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', authorId: 'm1', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e4', date: '2025-11-15', time: '16:30', title: '永観堂 禅林寺・紅葉ライトアップ拝観', type: 'sightseeing', cost: 1000, status: 'approved', authorId: 'm1', location: '永観堂', memo: '「もみじの永観堂」と呼ばれる約3,000本の楓が池に映るリフレクションは必見。', photos: [{ id: 'pe_2', url: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&w=800&q=80', authorId: 'm1', authorName: 'たびたび公式', isPublic: true }, { id: 'pe_3', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', authorId: 'm1', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e5', date: '2025-11-15', time: '18:30', title: '京都嵐山温泉 花伝抄 チェックイン（5種の貸切露天風呂）', type: 'hotel', cost: 18000, status: 'approved', authorId: 'm1', location: '京都嵐山温泉 花伝抄', memo: '予約不要で空いていれば何度でも入れる5つの貸切露天風呂と、夜鳴きそば無料サービスが魅力。', photos: [{ id: 'pe_5', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', authorId: 'm1', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e6', date: '2025-11-16', time: '09:00', title: '早朝の竹林の小径＆渡月橋さんぽ', type: 'sightseeing', cost: 0, status: 'approved', authorId: 'm1', location: '嵐山 竹林の小径', memo: '観光客が増える10時前の時間帯なら、静かな竹林を独り占めできました。', photos: [{ id: 'pe_6', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', authorId: 'm1', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e7', date: '2025-11-16', time: '10:30', title: '保津川下り体験（亀岡〜嵐山 渓谷16kmの舟旅）', type: 'active', cost: 6000, status: 'approved', authorId: 'm1', location: '保津川下り乗船場', memo: '船頭さんの軽快なトークと水しぶきが楽しい約2時間のスリル満点クルーズ！', photos: [] },
      { id: 'e8', date: '2025-11-16', time: '13:00', title: '嵐山よしむら（渡月橋を一望する石臼挽き手打ち蕎麦）', type: 'meal', cost: 2400, status: 'approved', authorId: 'm1', location: '嵐山よしむら', memo: '2階の窓際席からの渡月橋ビューが最高。名物の「渡月膳」がおすすめです。', photos: [{ id: 'pe_8', url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', authorId: 'm1', authorName: 'たびたび公式', isPublic: true }] }
    ]
  },
  {
    id: 'PUB-2',
    title: '【箱根】彫刻の森美術館＆大涌谷・芦ノ湖畔ベーカリーを巡る温泉休日',
    description: 'ロマンスカーで箱根湯本へ！老舗の自然薯そば、ステンドグラスの塔が映える美術館、強羅の露天風呂付き客室で日頃の疲れをリセットできた1泊2日の実録コース。',
    destination: '神奈川県', region: '関東', authorId: 'm2', authorName: 'たびたろう', authorAvatar: MALE_AVATARS[1],
    authorBio: '温泉と美味しいお酒が大好き。関東近郊のんびり旅メインです♨️',
    likes: 389, views: 1890, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-10-25', endDate: '2025-10-26', budget: 30300, publishedAt: Date.now() - (4 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm2', name: 'たびたろう', color: '#E2A98B' }],
    comments: [],
    events: [
      { id: 'e21', date: '2025-10-25', time: '10:30', title: '箱根湯本駅到着・駅前商店街で食べ歩き', type: 'meal', cost: 1200, status: 'approved', authorId: 'm2', location: '箱根湯本駅', memo: '菊川商店の焼きたて箱根まんじゅうと、籠清の揚げかまぼこ棒をシェア。', photos: [] },
      { id: 'e22', date: '2025-10-25', time: '12:00', title: 'はつ花そば 本店（水を使わない自然薯せいろ蕎麦）', type: 'meal', cost: 1800, status: 'approved', authorId: 'm2', location: 'はつ花そば 本店', memo: '昭和9年創業。自然薯と卵だけで打った喉越し抜群の蕎麦は箱根ランチの鉄板。', photos: [{ id: 'pe_22', url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', authorId: 'm2', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e23', date: '2025-10-25', time: '14:00', title: '箱根 彫刻の森美術館（ステンドグラスの塔＆温泉足湯）', type: 'sightseeing', cost: 2000, status: 'approved', authorId: 'm2', location: '彫刻の森美術館', memo: '螺旋階段を登る「幸せをよぶシンフォニー彫刻」は圧巻！園内の源泉かけ流し足湯でひと休み。', photos: [{ id: 'pe_23', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', authorId: 'm2', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e24', date: '2025-10-25', time: '16:30', title: '強羅温泉 季の湯 雪月花（全室檜の露天風呂付き宿）', type: 'hotel', cost: 21000, status: 'approved', authorId: 'm2', location: '強羅温泉 季の湯 雪月花', memo: '強羅駅徒歩1分。湯上がり処のアイスや炭酸泉の大浴場も充実していました。', photos: [{ id: 'pe_24', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', authorId: 'm2', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e25', date: '2025-10-26', time: '10:00', title: '箱根ロープウェイで大涌谷へ（名物・黒たまご＆富士山眺望）', type: 'sightseeing', cost: 1500, status: 'approved', authorId: 'm2', location: '大涌谷', memo: '地熱と火山ガスで作られる延命祈願の「黒たまご」を堪能。', photos: [] },
      { id: 'e26', date: '2025-10-26', time: '12:00', title: 'Bakery & Table 箱根（芦ノ湖ビュー足湯テラス＆米粉カレーパン）', type: 'meal', cost: 1800, status: 'approved', authorId: 'm2', location: 'Bakery & Table 箱根', memo: '芦ノ湖の目の前！1階の足湯カウンター席で食べる熱々の米粉カレードーナツが最高でした。', photos: [{ id: 'pe_26', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', authorId: 'm2', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e27', date: '2025-10-26', time: '14:00', title: '箱根神社・平和の鳥居（湖上に浮かぶ朱色の鳥居参拝）', type: 'sightseeing', cost: 1000, status: 'approved', authorId: 'm2', location: '箱根神社', memo: '参拝帰りは境内の「権現からめもち（5色餅）」でほっと一息。', photos: [{ id: 'pe_27', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', authorId: 'm2', authorName: 'たびたび公式', isPublic: true }] }
    ]
  },
  {
    id: 'PUB-3',
    title: '【札幌・小樽】海鮮・ジンギスカン・夜パフェ！北海道グルメ完全制覇2日間',
    description: '二条市場のウニ・イクラ丼から始まり、小樽運河クルーズ、サッポロビール園の生ラム、すすきの夜パフェ、翌朝のスープカレーまで実際に食べ歩いた胃袋大満足プラン！',
    destination: '北海道', region: '北海道・東北', authorId: 'm3', authorName: 'くいしんぼう', authorAvatar: FEMALE_AVATARS[2],
    authorBio: '食べるために旅をする！全国のローカルグルメ・カフェを開拓中🍰',
    likes: 412, views: 2150, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-09-13', endDate: '2025-09-14', budget: 25300, publishedAt: Date.now() - (6 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm3', name: 'くいしんぼう', color: '#7A9D8C' }],
    comments: [],
    events: [
      { id: 'e31', date: '2025-09-13', time: '10:30', title: '札幌二条市場 大磯で特選ウニ・イクラ・カニ海鮮丼', type: 'meal', cost: 3400, status: 'approved', authorId: 'm3', location: '札幌二条市場', memo: '朝早くから営業。濃厚なバフンウニとプチプチのイクラが溢れる「大磯丼」は感動もの。', photos: [{ id: 'pe_31', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', authorId: 'm3', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e32', date: '2025-09-13', time: '13:30', title: 'JR快速エアポートで小樽へ！小樽運河クルーズ＆北一硝子・ルタオ本店', type: 'sightseeing', cost: 3300, status: 'approved', authorId: 'm3', location: '小樽運河', memo: 'ルタオ本店2階カフェの「奇跡の口どけセット（生ドゥーブルフロマージュ）」は必食。', photos: [{ id: 'pe_32', url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80', authorId: 'm3', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e33', date: '2025-09-13', time: '18:30', title: 'サッポロビール園 ケッセルホールで生ラムジンギスカン＆直送生ビール', type: 'meal', cost: 4800, status: 'approved', authorId: 'm3', location: 'サッポロビール園', memo: '赤レンガのレトロな巨大ホールで味わうサッポロクラシック生と臭みのない生ラムが最高！', photos: [{ id: 'pe_33', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', authorId: 'm3', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e34', date: '2025-09-13', time: '21:00', title: '夜パフェ専門店「パフェ、珈琲、酒、佐藤」で札幌シメパフェ', type: 'meal', cost: 2000, status: 'approved', authorId: 'm3', location: 'パフェ、珈琲、酒、佐藤', memo: '塩キャラメルとピスタチオのパフェが看板メニュー。札幌の夜はこれで締めるのが流儀！', photos: [] },
      { id: 'e35', date: '2025-09-13', time: '22:30', title: '札幌駅・大通エリア 天然温泉大浴場付きホテル宿泊', type: 'hotel', cost: 10000, status: 'approved', authorId: 'm3', location: '札幌駅周辺', memo: 'サウナ・露天風呂付きのシティホテルでゆっくり休養。', photos: [] },
      { id: 'e36', date: '2025-09-14', time: '11:30', title: 'スープカレー GARAKU 札幌本店でやわらかチキンレッグと野菜カレー', type: 'meal', cost: 1800, status: 'approved', authorId: 'm3', location: 'スープカレー GARAKU', memo: '和風ダシと21種スパイスの奥深いスープ。炙りチーズトッピングがおすすめ！', photos: [{ id: 'pe_36', url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', authorId: 'm3', authorName: 'たびたび公式', isPublic: true }] }
    ]
  },
  {
    id: 'PUB-4',
    title: '【金沢】近江町市場ののどぐろ丼・兼六園・21世紀美術館を巡る美と美食の旅',
    description: '北陸新幹線で行った古都・金沢！朝獲れ海鮮、日本三名園の兼六園、ひがし茶屋街の金箔スイーツ、現代アートまで徒歩＆周遊バスでコンパクトに回れました。',
    destination: '石川県', region: '中部', authorId: 'm4', authorName: '北陸さんぽ', authorAvatar: FEMALE_AVATARS[3],
    authorBio: '北陸の美味しい海鮮と和菓子を探して旅しています🍣',
    likes: 356, views: 1740, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-10-04', endDate: '2025-10-05', budget: 26300, publishedAt: Date.now() - (8 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm4', name: '北陸さんぽ', color: '#D4B886' }],
    comments: [],
    events: [
      { id: 'e41', date: '2025-10-04', time: '10:30', title: '金沢駅「鼓門」で記念撮影＆城下まち金沢周遊バス1日乗車券購入', type: 'transport', cost: 800, status: 'approved', authorId: 'm4', location: '金沢駅', memo: '世界で最も美しい駅14選に選ばれた迫力の木造門「鼓門」は最初のシャッタースポット。', photos: [] },
      { id: 'e42', date: '2025-10-04', time: '11:30', title: '近江町市場「山さん寿司 本店」で豪華海鮮丼＆炙りのどぐろ握り', type: 'meal', cost: 3800, status: 'approved', authorId: 'm4', location: '近江町市場', memo: '器からはみ出す18種類のネタが乗った海鮮丼と、脂がとろける炙りのどぐろ！', photos: [{ id: 'pe_42', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', authorId: 'm4', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e43', date: '2025-10-04', time: '13:30', title: '兼六園＆金沢城公園（徽軫灯籠・時雨亭でお抹茶と生菓子）', type: 'sightseeing', cost: 1100, status: 'approved', authorId: 'm4', location: '兼六園', memo: '日本三名園の美しい庭園。園内の「時雨亭」で庭園を眺めながらお抹茶体験ができました。', photos: [{ id: 'pe_43', url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', authorId: 'm4', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e44', date: '2025-10-04', time: '15:30', title: 'ひがし茶屋街「箔一」で輝く金箔ソフト＆紅殻格子通り散策', type: 'meal', cost: 1600, status: 'approved', authorId: 'm4', location: 'ひがし茶屋街', memo: '金箔1枚を目の前で贅沢に貼り付けるソフトクリームは写真映え抜群！', photos: [{ id: 'pe_44', url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80', authorId: 'm4', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e45', date: '2025-10-04', time: '18:00', title: '金沢町家リノベーションホテル宿泊＆おでん居酒屋ディナー', type: 'hotel', cost: 16500, status: 'approved', authorId: 'm4', location: '香林坊・片町エリア', memo: '夜は片町の名店で車麩やバイ貝が入った「金沢おでん」と加賀の地酒を堪能。', photos: [] },
      { id: 'e46', date: '2025-10-05', time: '10:00', title: '金沢21世紀美術館（《スイミング・プール》鑑賞）＆長町武家屋敷跡', type: 'sightseeing', cost: 2500, status: 'approved', authorId: 'm4', location: '金沢21世紀美術館', memo: 'プール地下部の入場は朝9時のWEB順番待ち受付または事前予約を忘れずに！', photos: [] }
    ]
  },
  {
    id: 'PUB-5',
    title: '【沖縄・宮古島】伊良部大橋ドライブと宮古ブルーの絶景ビーチ・南国カフェ旅',
    description: '東洋一美しい与那覇前浜ビーチ、無料で渡れる日本最長の伊良部大橋、ウミガメと泳いだシュノーケル、完熟マンゴーパフェまで詰め込んだ極上リゾート実録コース。',
    destination: '沖縄県', region: '九州・沖縄', authorId: 'm5', authorName: 'ちゅら旅', authorAvatar: MALE_AVATARS[2],
    authorBio: '離島と青い海が大好き！年に3回は沖縄に行きます🌺',
    likes: 520, views: 2890, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-07-19', endDate: '2025-07-20', budget: 35600, publishedAt: Date.now() - (10 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm5', name: 'ちゅら旅', color: '#8FA8C8' }],
    comments: [],
    events: [
      { id: 'e51', date: '2025-07-19', time: '11:00', title: '宮古空港でレンタカー出発＆古謝そば屋で宮古そばランチ', type: 'meal', cost: 5500, status: 'approved', authorId: 'm5', location: '古謝そば屋', memo: '昭和7年創業の老舗。あっさりカツオ出汁の自家製生麺と、とろとろに煮込まれたソーキが絶品。', photos: [{ id: 'pe_51', url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', authorId: 'm5', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e52', date: '2025-07-19', time: '13:00', title: '与那覇前浜ビーチ（7km続く真っ白なパウダーサンドと宮古ブルー）', type: 'sightseeing', cost: 0, status: 'approved', authorId: 'm5', location: '与那覇前浜ビーチ', memo: '東洋一美しいと称されるビーチ。来間大橋とのコントラストがまるで海外リゾートのよう！', photos: [{ id: 'pe_52', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', authorId: 'm5', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e53', date: '2025-07-19', time: '15:00', title: '伊良部大橋（全長3,540mの海上絶景ドライブ）＆17END', type: 'transport', cost: 0, status: 'approved', authorId: 'm5', location: '伊良部大橋', memo: '窓を開けてエメラルドグリーンの海の上を爽快ドライブ！干潮時の「17END」の遠浅の海も必見。', photos: [] },
      { id: 'e54', date: '2025-07-19', time: '18:00', title: 'オーシャンビューリゾート宿泊＆島唄三線ライブ居酒屋で宮古牛ディナー', type: 'hotel', cost: 21800, status: 'approved', authorId: 'm5', location: '宮古島シギラ・平良エリア', memo: '希少な宮古牛の握りや海ぶどう、島らっきょうを泡盛とともに満喫！', photos: [] },
      { id: 'e55', date: '2025-07-20', time: '09:30', title: '新城海岸でウミガメ遭遇シュノーケリング体験', type: 'active', cost: 6500, status: 'approved', authorId: 'm5', location: '新城海岸', memo: '浅瀬でもサンゴ礁と熱帯魚がいっぱい！野生のウミガメと一緒に泳げました。', photos: [{ id: 'pe_55', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', authorId: 'm5', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e56', date: '2025-07-20', time: '13:30', title: 'ユートピアファーム宮古島（花々に囲まれた農園で完熟マンゴーパフェ）', type: 'meal', cost: 1800, status: 'approved', authorId: 'm5', location: 'ユートピアファーム宮古島', memo: 'ブーゲンビリアが咲き誇る温室パーラーで食べる濃厚マンゴーソフト＆パフェは外せません。', photos: [] }
    ]
  },
  {
    id: 'PUB-6',
    title: '【福岡・糸島】屋台はしご酒と海辺の糸島カフェドライブ＆もつ鍋満喫コース',
    description: '空港から博多駅まで地下鉄でわずか5分！夜は中洲・天神の屋台と本場もつ鍋、翌日は青い海が広がる糸島エリアで夫婦岩とサンセットカフェを巡った鉄板プラン。',
    destination: '福岡県', region: '九州・沖縄', authorId: 'm6', authorName: '九州グルメ探検隊', authorAvatar: MALE_AVATARS[3],
    authorBio: '福岡を拠点に九州のうまかもんと温泉を巡っています🍜',
    likes: 334, views: 1680, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-09-27', endDate: '2025-09-28', budget: 24900, publishedAt: Date.now() - (12 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm6', name: '九州グルメ探検隊', color: '#E2A98B' }],
    comments: [],
    events: [
      { id: 'e61', date: '2025-09-27', time: '11:30', title: '博多駅到着！「博多一双 博多駅東本店」で泡系豚骨ラーメン', type: 'meal', cost: 1000, status: 'approved', authorId: 'm6', location: '博多一双 博多駅東本店', memo: '「豚骨カプチーノ」と呼ばれる濃厚クリーミーなスープが絶品の行列店。', photos: [{ id: 'pe_61', url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', authorId: 'm6', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e62', date: '2025-09-27', time: '14:00', title: '太宰府天満宮 参拝＆かさの家の焼きたて梅ヶ枝餅食べ歩き', type: 'sightseeing', cost: 1200, status: 'approved', authorId: 'm6', location: '太宰府天満宮', memo: '隈研吾氏デザインのスターバックス太宰府天満宮表参道店と、パリッと香ばしい焼きたて梅ヶ枝餅をチェック！', photos: [] },
      { id: 'e63', date: '2025-09-27', time: '18:30', title: '博多もつ鍋「やま中 本店」でみそ味もつ鍋ディナー', type: 'meal', cost: 4800, status: 'approved', authorId: 'm6', location: '博多もつ鍋 やま中', memo: '福岡のもつ鍋といえばここ！濃厚な特製みそスープとプリプリの国産牛もつ、締めのちゃんぽん麺まで最高。', photos: [{ id: 'pe_63', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', authorId: 'm6', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e64', date: '2025-09-27', time: '21:00', title: '中洲・天神屋台街で焼きラーメン＆一口餃子のはしご酒', type: 'meal', cost: 2500, status: 'approved', authorId: 'm6', location: '中洲屋台街', memo: '那珂川沿いの夜景を眺めながら、屋台名物の焼きラーメンとおでんを体験。', photos: [{ id: 'pe_64', url: 'https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=800&q=80', authorId: 'm6', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e65', date: '2025-09-27', time: '22:30', title: '博多・天神エリア ホテル宿泊', type: 'hotel', cost: 11000, status: 'approved', authorId: 'm6', location: '天神駅周辺', memo: '翌朝の糸島ドライブに備えてゆっくり就寝。', photos: [] },
      { id: 'e66', date: '2025-09-28', time: '11:00', title: '糸島・桜井二見ヶ浦（海上の白い鳥居と夫婦岩）＆ヤシの木ブランコ', type: 'sightseeing', cost: 2000, status: 'approved', authorId: 'm6', location: '桜井二見ヶ浦', memo: 'エメラルドグリーンの海に立つ白い鳥居は糸島No.1のフォトスポット。', photos: [{ id: 'pe_66', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', authorId: 'm6', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e67', date: '2025-09-28', time: '12:30', title: '糸島「LONDON BUS CAFE」＆海辺カフェでサンセットランチ', type: 'meal', cost: 2400, status: 'approved', authorId: 'm6', location: '糸島サンセットロード', memo: '二見ヶ浦すぐ近くの海沿いカフェでロコモコランチと塩ジェラートを満喫。', photos: [] }
    ]
  },
  {
    id: 'PUB-7',
    title: '【広島・宮島＆尾道】厳島神社の大鳥居と坂の街・尾道レトロ散歩1泊2日',
    description: '世界遺産・宮島の海に浮かぶ大鳥居と揚げもみじ食べ歩き、2日目は映画の舞台のような坂道と猫の街・尾道で絶景ロープウェイと尾道ラーメンを味わった瀬戸内旅。',
    destination: '広島県', region: '中国・四国', authorId: 'm7', authorName: 'せとうちライダー', authorAvatar: MALE_AVATARS[4],
    authorBio: '瀬戸内の穏やかな海と島旅が大好きです⛩️',
    likes: 298, views: 1520, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-05-10', endDate: '2025-05-11', budget: 23650, publishedAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm7', name: 'せとうちライダー', color: '#7A9D8C' }],
    comments: [],
    events: [
      { id: 'e71', date: '2025-05-10', time: '10:30', title: '宮島口からフェリーで宮島へ！厳島神社 参拝＆大鳥居', type: 'sightseeing', cost: 1000, status: 'approved', authorId: 'm7', location: '厳島神社', memo: '満潮時は海に浮かぶ神秘的な姿、干潮時は大鳥居の真下まで歩いて行けます。事前に潮見表をチェック！', photos: [{ id: 'pe_71', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', authorId: 'm7', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e72', date: '2025-05-10', time: '12:15', title: 'うえの（明治34年創業・宮島名物の極上あなごめし）＆焼き牡蠣・揚げもみじ', type: 'meal', cost: 3500, status: 'approved', authorId: 'm7', location: 'あなごめし うえの', memo: '穴場の宮島口本店または表参道商店街で、香ばしく焼き上げた名物あなごめしと熱々の揚げもみじ（紅葉堂）を堪能。', photos: [] },
      { id: 'e73', date: '2025-05-10', time: '16:00', title: '平和記念公園・原爆ドーム見学＆お好み村で本場広島お好み焼き', type: 'meal', cost: 2200, status: 'approved', authorId: 'm7', location: 'お好み村', memo: '鉄板の目の前でヘラを使って食べる、キャベツたっぷりの広島風お好み焼き（そば肉玉・イカ天入り）！', photos: [{ id: 'pe_73', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', authorId: 'm7', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e74', date: '2025-05-10', time: '19:00', title: '広島市内または尾道ウォーターフロントホテル宿泊', type: 'hotel', cost: 13500, status: 'approved', authorId: 'm7', location: 'ONOMICHI U2', memo: '海運倉庫を改装したおしゃれな複合施設「ONOMICHI U2」のホテル泊もおすすめ。', photos: [] },
      { id: 'e75', date: '2025-05-11', time: '10:30', title: '千光寺山ロープウェイ＆展望台PEAK・猫の細道さんぽ', type: 'sightseeing', cost: 1200, status: 'approved', authorId: 'm7', location: '千光寺頂上展望台 PEAK', memo: 'ロープウェイで山頂へ登り、尾道水道としまなみ海道の島々を一望しながら坂道を下るルートが楽ちんでした。', photos: [{ id: 'pe_75', url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800&q=80', authorId: 'm7', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e76', date: '2025-05-11', time: '12:30', title: '尾道ラーメン「朱華園・壱番館」＆古民家カフェで瀬戸内レモンスイーツ', type: 'meal', cost: 2250, status: 'approved', authorId: 'm7', location: '尾道ラーメン 壱番館', memo: '小魚出汁が効いた醤油スープに背脂ミンチが浮かぶ本場の尾道ラーメン！', photos: [] }
    ]
  },
  {
    id: 'PUB-8',
    title: '【伊勢志摩】お伊勢参りとおかげ横丁食べ歩き＆英虞湾の絶景テラス旅',
    description: '2000年の歴史を誇る伊勢神宮（外宮・内宮）を正式参拝した後は、おかげ横丁で赤福と松阪牛グルメ！翌日は志摩の横山展望台でリアス海岸の絶景を訪ねた実録旅。',
    destination: '三重県', region: '関西', authorId: 'm8', authorName: 'みえ旅ガイド', authorAvatar: FEMALE_AVATARS[4],
    authorBio: '伊勢志摩のパワースポットと海の幸を発信しています⛩️🦞',
    likes: 315, views: 1610, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-06-07', endDate: '2025-06-08', budget: 29800, publishedAt: Date.now() - (16 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm8', name: 'みえ旅ガイド', color: '#B0A3D4' }],
    comments: [],
    events: [
      { id: 'e81', date: '2025-06-07', time: '10:30', title: '伊勢市駅到着・伊勢神宮「外宮（豊受大神宮）」から正式参拝', type: 'sightseeing', cost: 0, status: 'approved', authorId: 'm8', location: '伊勢神宮 外宮', memo: 'お伊勢参りは「外宮から内宮へ」の順で回るのが古来からの習わし。清々しい杜の空気で心が洗われます。', photos: [] },
      { id: 'e82', date: '2025-06-07', time: '12:00', title: '伊勢神宮「内宮（皇大神宮）」宇治橋・五十鈴川御手洗場〜正宮参拝', type: 'sightseeing', cost: 500, status: 'approved', authorId: 'm8', location: '伊勢神宮 内宮', memo: '五十鈴川の澄んだ流れで手を清めてから正宮へ。巨木に囲まれた日本最高峰の聖域。', photos: [{ id: 'pe_82', url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80', authorId: 'm8', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e83', date: '2025-06-07', time: '13:30', title: 'おはらい町・おかげ横丁で名物「伊勢うどん・松阪牛にぎり・赤福本店」食べ歩き', type: 'meal', cost: 3500, status: 'approved', authorId: 'm8', location: 'おかげ横丁', memo: 'ふくすけの太くて柔らかい伊勢うどん、松阪牛の炙り寿司、五十鈴川を眺めながらいただく赤福本店の作りたて赤福餅！', photos: [{ id: 'pe_83', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', authorId: 'm8', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e84', date: '2025-06-07', time: '17:00', title: '鳥羽・賢島エリア 海望む温泉旅館に宿泊（伊勢海老・鮑の会席）', type: 'hotel', cost: 21000, status: 'approved', authorId: 'm8', location: '賢島・鳥羽温泉', memo: '伊勢志摩ならではのプリプリの伊勢海老お造りとアワビの踊り焼き、露天風呂を堪能。', photos: [] },
      { id: 'e85', date: '2025-06-08', time: '10:30', title: '横山展望台「ミラドール志摩」で英虞湾のリアス海岸パノラマ＆カフェ', type: 'sightseeing', cost: 1000, status: 'approved', authorId: 'm8', location: '横山展望台', memo: 'ミシュラン・グリーンガイド一つ星！60以上の島々が浮かぶ英虞湾を木製デッキテラスから一望できました。', photos: [] },
      { id: 'e86', date: '2025-06-08', time: '12:30', title: '志摩地中海村（白い街並み散策＆伊勢志摩海鮮パエリアランチ）', type: 'meal', cost: 3800, status: 'approved', authorId: 'm8', location: '志摩地中海村', memo: 'スペインの街並みを再現した真っ白なリゾート村。どこを撮っても海外旅行気分が味わえます！', photos: [] }
    ]
  },
  {
    id: 'PUB-9',
    title: '【信州・軽井沢＆松本】森のベーカリー朝食と国宝・松本城＆城下町カフェ巡り',
    description: '緑に囲まれた軽井沢のテラスで高原モーニングを楽しんだあと、国宝・松本城と中町通り・縄手通りのクラフト雑貨＆名物信州そばを巡った爽やかな信州実録コース。',
    destination: '長野県', region: '中部', authorId: 'm9', authorName: '高原カフェ部', authorAvatar: FEMALE_AVATARS[1],
    authorBio: '信州のカフェとパン屋さん巡りが趣味です🥐',
    likes: 284, views: 1490, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-08-09', endDate: '2025-08-10', budget: 25400, publishedAt: Date.now() - (18 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm9', name: '高原カフェ部', color: '#7A9D8C' }],
    comments: [],
    events: [
      { id: 'e91', date: '2025-08-09', time: '09:30', title: 'ベーカリー＆レストラン沢村 旧軽井沢で森のテラスモーニング', type: 'meal', cost: 2200, status: 'approved', authorId: 'm9', location: 'ベーカリー＆レストラン沢村 旧軽井沢', memo: '20種類以上の自家製酵母パンと厚切りベーコンエッグの朝食プレート。木漏れ日のテラス席が最高！', photos: [{ id: 'pe_91', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', authorId: 'm9', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e92', date: '2025-08-09', time: '11:30', title: '白糸の滝（マイナスイオン溢れる湾曲の滝）＆旧軽井沢銀座通り散策', type: 'sightseeing', cost: 1500, status: 'approved', authorId: 'm9', location: '軽井沢 白糸の滝', memo: '高さ3m・幅70mの岩肌から地下水が絹糸のように流れ落ちる神秘的なスポット。ミカド珈琲のモカソフトも定番。', photos: [] },
      { id: 'e93', date: '2025-08-09', time: '14:30', title: '星野エリア「ハルニレテラス」で丸山珈琲＆楡の木立の川辺さんぽ', type: 'meal', cost: 1500, status: 'approved', authorId: 'm9', location: 'ハルニレテラス', memo: '100本を超えるハルニレ（春楡）の木立に沿ってウッドデッキが続くおしゃれな小さな街。', photos: [] },
      { id: 'e94', date: '2025-08-09', time: '17:30', title: '松本・扉温泉または美ヶ原温泉・浅間温泉の宿にチェックイン', type: 'hotel', cost: 16500, status: 'approved', authorId: 'm9', location: '松本市 浅間温泉', memo: '1300年の歴史を持つ松本の奥座敷・浅間温泉で信州プレミアム牛と源泉かけ流し温泉を堪能。', photos: [] },
      { id: 'e95', date: '2025-08-10', time: '10:00', title: '国宝・松本城（現存五重六階の漆黒の天守と北アルプスの眺望）', type: 'sightseeing', cost: 700, status: 'approved', authorId: 'm9', location: '松本城', memo: 'お堀の水面に映る黒と白のコントラストと、背景にそびえる北アルプスの山々が圧巻の美しさでした。', photos: [{ id: 'pe_95', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', authorId: 'm9', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e96', date: '2025-08-10', time: '12:00', title: '松本・中町通り＆縄手通り散策と「蕎麦倶楽部 佐々木」で本格手打ち信州蕎麦', type: 'meal', cost: 3000, status: 'approved', authorId: 'm9', location: '松本市 中町通り', memo: 'なまこ壁の蔵造りが並ぶ中町通りで民芸品やカフェを巡り、香り高い信州の十割蕎麦と山賊焼きを堪能！', photos: [] }
    ]
  },
  {
    id: 'PUB-10',
    title: '【別府・由布院】地獄めぐりと金鱗湖の朝霧・由布岳を望む露天風呂と豊後牛旅',
    description: '日本一の湧出量を誇るおんせん県・大分！別府の地獄蒸し体験から、湯布院の湯の坪街道食べ歩き、金鱗湖の幻想的な朝霧まで九州屈指の温泉リゾートを巡った実録旅。',
    destination: '大分県', region: '九州・沖縄', authorId: 'm10', authorName: 'おんせん県めぐり', authorAvatar: MALE_AVATARS[0],
    authorBio: '九州の秘湯・名湯を100ヶ所以上巡っています♨️',
    likes: 367, views: 1820, likedBy: [],
    covers: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80'
    ],
    startDate: '2025-11-01', endDate: '2025-11-02', budget: 31200, publishedAt: Date.now() - (20 * 24 * 60 * 60 * 1000),
    members: [{ id: 'm10', name: 'おんせん県めぐり', color: '#D4B886' }],
    comments: [],
    events: [
      { id: 'e101', date: '2025-11-01', time: '10:30', title: '別府「海地獄・かまど地獄」めぐり＆温泉ピータン・極楽まんじゅう', type: 'sightseeing', cost: 2200, status: 'approved', authorId: 'm10', location: '海地獄', memo: 'コバルトブルーに輝く98℃の「海地獄」は圧巻！温泉の蒸気で蒸したアツアツのプリンも名物です。', photos: [] },
      { id: 'e102', date: '2025-11-01', time: '12:30', title: '鉄輪温泉「地獄蒸し工房 鉄輪」で温泉蒸気を使った海鮮＆野菜の地獄蒸し体験', type: 'meal', cost: 2500, status: 'approved', authorId: 'm10', location: '地獄蒸し工房 鉄輪', memo: '約100℃の温泉蒸気釜に食材を入れて一気に蒸し上げる体験型ランチ！素材本来の甘みが凝縮されます。', photos: [{ id: 'pe_102', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', authorId: 'm10', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e103', date: '2025-11-01', time: '15:00', title: 'やまなみハイウェイ経由で由布院へ！湯の坪街道でB-speakロールケーキ＆金賞コロッケ食べ歩き', type: 'meal', cost: 2000, status: 'approved', authorId: 'm10', location: '湯の坪街道', memo: '由布岳を正面に望むメインストリート。Milch（ミルヒ）の焼きたてケーゼクーヘン（チーズケーキ）も必食！', photos: [] },
      { id: 'e104', date: '2025-11-01', time: '17:00', title: '由布院温泉・由布岳ビューの離れ露天風呂付き宿に宿泊', type: 'hotel', cost: 22000, status: 'approved', authorId: 'm10', location: '由布院温泉', memo: '雄大な由布岳を眺めながら入る源泉かけ流し露天風呂と、とろける「おおいた和牛（豊後牛）」の炭火焼き会席。', photos: [{ id: 'pe_104', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', authorId: 'm10', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e105', date: '2025-11-02', time: '08:00', title: '早朝の「金鱗湖」さんぽ（湖面から立ち上る幻想的な朝霧）', type: 'sightseeing', cost: 0, status: 'approved', authorId: 'm10', location: '金鱗湖', memo: '清水と温泉が同時に湧き出る湖。秋〜冬の早朝は湖面から白い朝霧が立ち上り、夢の中のような絶景に出会えました。', photos: [{ id: 'pe_105', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', authorId: 'm10', authorName: 'たびたび公式', isPublic: true }] },
      { id: 'e106', date: '2025-11-02', time: '11:30', title: '由布まぶし「心」で豊後牛まぶしランチ（3通りの食べ方で堪能）', type: 'meal', cost: 2500, status: 'approved', authorId: 'm10', location: '由布まぶし 心', memo: '1人前ずつ土鍋で炊き上げるご飯の上に炭火焼きの豊後牛がぎっしり！そのまま→薬味・柚子胡椒→特製出汁茶漬けで3度美味しい。', photos: [] }
    ]
  }
];

const initialNotifications = [];

// --- Utils ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateTripCode = () => 'TABI-' + Math.random().toString(36).substr(2, 8).toUpperCase();
const getTodayString = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const safeParse = (key, fallback) => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : fallback; } catch (e) { return fallback; } };

// ==========================================
// ★ Google AI (Gemini API) コスト削減＆悪用防止エンジン
// ==========================================
// 1. 無料ユーザーの1日あたりの基本AI生成回数上限（いたずら連打・高額請求を100%防止）
const DAILY_AI_BASE_LIMIT = 5;
// 2. 動画広告を1本視聴したときに追加されるボーナス回数
const REWARD_AD_BONUS_COUNT = 3;
// 3. 定番エリア判定リスト（初回はAPIを叩かず高品質データ/キャッシュから0秒・0円で返却）
const POPULAR_CACHED_AREAS = ['京都', '沖縄', '宮古', '石垣', '那覇', '箱根', '神奈川', '北海道', '札幌', '小樽', '函館', '石川', '金沢', '福岡', '博多', '糸島', '広島', '宮島', '尾道', '三重', '伊勢', '志摩', '長野', '軽井沢', '松本', '大分', '別府', '由布院', '湯布院', '鎌倉', '江ノ島', '日光', '鬼怒川', '高山', '白川郷', '香川', '高松', '小豆島', '宮城', '仙台', '松島', '東京', '大阪', '熱海', '伊豆', '草津'];

// ★ 「⚡ 定番エリアは枠消費0」の i ボタンで表示する地方別ガイド一覧
const POPULAR_AREAS_GUIDE = [
  { region: '北海道・東北', areas: ['北海道（札幌・小樽・函館）', '宮城県（仙台・松島）'] },
  { region: '関東', areas: ['東京都', '神奈川県（箱根・鎌倉・江ノ島）', '栃木県（日光・鬼怒川）', '群馬県（草津温泉）'] },
  { region: '中部・北陸', areas: ['石川県（金沢）', '長野県（軽井沢・松本）', '静岡県（熱海・伊豆）', '岐阜県（飛騨高山・白川郷）'] },
  { region: '関西', areas: ['京都府', '大阪府', '三重県（伊勢・志摩）'] },
  { region: '中国・四国', areas: ['広島県（宮島・尾道）', '香川県（高松・小豆島）'] },
  { region: '九州・沖縄', areas: ['福岡県（博多・糸島）', '大分県（別府・由布院）', '沖縄県（那覇・宮古島・石垣島）'] }
];

const getAiQuotaStatus = () => {
  const today = getTodayString();
  const saved = safeParse('tabitabi_ai_quota', { date: today, used: 0, bonus: 0 });
  if (!saved || saved.date !== today) {
    const reset = { date: today, used: 0, bonus: 0 };
    try { localStorage.setItem('tabitabi_ai_quota', JSON.stringify(reset)); } catch (e) {}
    return { ...reset, limit: DAILY_AI_BASE_LIMIT, remaining: DAILY_AI_BASE_LIMIT };
  }
  const limit = DAILY_AI_BASE_LIMIT + (Number(saved.bonus) || 0);
  const used = Number(saved.used) || 0;
  return {
    date: today,
    used,
    bonus: Number(saved.bonus) || 0,
    limit,
    remaining: Math.max(0, limit - used)
  };
};

const consumeAiQuota = () => {
  const current = getAiQuotaStatus();
  if (current.remaining <= 0) return { ok: false, status: current };
  const next = { date: current.date, used: current.used + 1, bonus: current.bonus };
  try { localStorage.setItem('tabitabi_ai_quota', JSON.stringify(next)); } catch (e) {}
  return { ok: true, status: getAiQuotaStatus() };
};

const addRewardAdBonusQuota = () => {
  const current = getAiQuotaStatus();
  const next = { date: current.date, used: current.used, bonus: current.bonus + REWARD_AD_BONUS_COUNT };
  try { localStorage.setItem('tabitabi_ai_quota', JSON.stringify(next)); } catch (e) {}
  return getAiQuotaStatus();
};

// AI生成結果のローカルキャッシュ取得・保存（同じ条件なら2回目以降はAPI代0円）
const getCachedAiResponse = (cacheKey) => {
  const cacheMap = safeParse('tabitabi_ai_plan_cache_v1', {});
  return cacheMap[cacheKey] || null;
};

const setCachedAiResponse = (cacheKey, data) => {
  try {
    const cacheMap = safeParse('tabitabi_ai_plan_cache_v1', {});
    const keys = Object.keys(cacheMap);
    if (keys.length > 40) delete cacheMap[keys[0]];
    cacheMap[cacheKey] = data;
    localStorage.setItem('tabitabi_ai_plan_cache_v1', JSON.stringify(cacheMap));
  } catch (e) {}
};

// Google Gemini API 構造化出力呼び出し（指数バックオフ付き）
const callGoogleGeminiStructured = async ({ systemPrompt, userPrompt, responseSchema }) => {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema
    }
  };

  const delays = [1000, 2000];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
      throw new Error('Empty AI response');
    } catch (err) {
      if (attempt === delays.length) throw err;
      await new Promise(r => setTimeout(r, delays[attempt]));
    }
  }
};

// 🎬 動画広告視聴でAI利用回数を＋3回増やすリワード広告モーダル
function RewardVideoAdModal({ onClose, onCompleteReward }) {
  useLockBodyScroll(true);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setCompleted(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <div className="fixed inset-0 bg-black/80 z-[320] flex justify-center items-center p-4 animate-in fade-in" onClick={completed ? onClose : undefined}>
      <div className="bg-stone-900 text-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-stone-700 text-center space-y-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center text-[11px] font-bold text-stone-400">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
            🎬 リワード動画広告
          </span>
          {completed ? (
            <span className="text-emerald-400 font-extrabold">視聴完了！</span>
          ) : (
            <span>残り {secondsLeft} 秒</span>
          )}
        </div>

        <div className="py-8 px-4 rounded-2xl bg-gradient-to-br from-[#7A9D8C]/30 via-sky-900/40 to-stone-800 border border-white/10 flex flex-col items-center justify-center space-y-2">
          <Sparkles size={36} className="text-amber-400 animate-pulse" />
          <p className="text-sm font-extrabold text-white">たびたび トラベルサポート</p>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            動画を見ると本日のGoogle AIプラン生成枠が<br />
            <span className="text-amber-300 font-extrabold">＋{REWARD_AD_BONUS_COUNT}回</span> すぐに回復します！
          </p>
        </div>

        <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${((3 - secondsLeft) / 3) * 100}%` }}
          />
        </div>

        {completed ? (
          <button
            type="button"
            onClick={() => {
              const nextStatus = addRewardAdBonusQuota();
              if (onCompleteReward) onCompleteReward(nextStatus);
              customAlert(`🎉 AI利用枠が＋${REWARD_AD_BONUS_COUNT}回増えました！（残り${nextStatus.remaining}回）`);
              onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-stone-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all active:scale-95"
          >
            🎁 ＋{REWARD_AD_BONUS_COUNT}回のAI利用枠を受け取る
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3.5 bg-stone-800 text-stone-500 font-bold rounded-2xl text-xs cursor-not-allowed"
          >
            動画を再生中...（あと{secondsLeft}秒）
          </button>
        )}
      </div>
    </div>
  );
}

// ★ 写真を同じしおりのメンバー間で高速・低容量で共有するためのクライアント側自動画像圧縮関数
// スマホの数MBある写真を長辺最大1200px・JPEG品質0.82（約100〜150KB）に自動軽量化します
const compressImageFile = (file, maxSide = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!file || typeof window === 'undefined') {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width > height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result || URL.createObjectURL(file));
        }
      };
      img.onerror = () => resolve(URL.createObjectURL(file));
      img.src = event.target?.result;
    };
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
};

// ★ 開発者が何もしなくても毎週・季節ごとに新しい公式ガイドを全自動生成するオートパイロット関数
const AUTO_SEASONAL_DESTINATIONS = [
  {
    dest: '神奈川県・鎌倉＆江ノ島',
    region: '関東',
    spot1: '小町通り（食べ歩き＆カフェ）',
    loc1: '鎌倉小町通り',
    spot2: '鶴岡八幡宮・報国寺（竹の庭と抹茶）',
    loc2: '報国寺',
    spot3: '江ノ電・鎌倉高校前＆七里ヶ浜 Billsでパンケーキランチ',
    loc3: 'bills 七里ヶ浜',
    spot4: '江の島シーキャンドル＆とびっちょ本店で湘南しらす丼ディナー',
    loc4: 'しらす問屋 とびっちょ 本店',
    dinnerNote: '【🍽️夕食提案：外食がおすすめ】江ノ島・鎌倉エリアは海沿いの名店が充実しているため、ホテルは素泊まり・朝食付きにして外でしらす料理や海鮮ディナーを楽しむのが正解！',
    cover: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    subPhoto: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: '栃木県・日光＆鬼怒川温泉',
    region: '関東',
    spot1: '日光東照宮（陽明門・三猿・眠り猫参拝）',
    loc1: '日光東照宮',
    spot2: '明治の館（名物オムレツライス＆チーズケーキニルバーナ）',
    loc2: '西洋料理 明治の館',
    spot3: '華厳の滝＆中禅寺湖畔ドライブ',
    loc3: '華厳ノ滝',
    spot4: '鬼怒川温泉 あさや（空中庭園露天風呂＆宿の豪華ビュッフェ夕食）',
    loc4: '鬼怒川温泉 あさや',
    dinnerNote: '【🍽️夕食提案：宿での夕食（1泊2食付き）が断然おすすめ】鬼怒川温泉エリアは夜になると周辺の飲食店が早く閉まるため、宿自慢の和洋中ビュッフェや会席料理を予約しておくのが安心です！',
    cover: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
    subPhoto: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: '岐阜県・飛騨高山＆白川郷',
    region: '中部',
    spot1: '宮川朝市＆古い町並（こって牛の飛騨牛にぎり寿司食べ歩き）',
    loc1: '飛騨こって牛',
    spot2: '世界遺産・白川郷 合掌造り集落＆荻町城跡展望台',
    loc2: '白川郷荻町城跡展望台',
    spot3: '味蔵天国（JAひだ直営・極上飛騨牛焼肉ディナー）',
    loc3: '味蔵天国',
    spot4: '高山グリーンホテル（天然温泉＆飛騨物産館）',
    loc4: '高山グリーンホテル',
    dinnerNote: '【🍽️夕食提案：宿の飛騨牛会席 または 高山駅前の焼肉名店へ外食】飛騨牛をガッツリ焼肉で味わうなら高山駅近くの「味蔵天国」へ外食、ゆっくり温泉と楽しむなら宿の飛騨牛朴葉みそ会席がおすすめ！',
    cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
    subPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: '香川県・高松＆小豆島',
    region: '中国・四国',
    spot1: '手打十段 うどんバカ一代（名物・釜バターうどん）',
    loc1: '手打十段 うどんバカ一代',
    spot2: '特別名勝 栗林公園（和船遊覧と掬月亭のお抹茶）',
    loc2: '栗林公園',
    spot3: 'フェリーで小豆島へ！小豆島オリーブ公園＆エンジェルロード',
    loc3: 'エンジェルロード',
    spot4: '骨付鳥 一鶴 高松店（名物・スパイシーな骨付鳥ディナー）＆高松市内ホテル泊',
    loc4: '骨付鳥 一鶴 高松店',
    dinnerNote: '【🍽️夕食提案：ホテルは朝食のみにして外食がおすすめ】高松夜は香川名物「骨付鳥 一鶴」や瀬戸内の海鮮居酒屋が徒歩圏内に揃っているため、外に食べに行くのが大正解です！',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    subPhoto: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80'
  },
  {
    dest: '宮城県・仙台＆松島',
    region: '北海道・東北',
    spot1: '仙台駅 ずんだ茶寮（ずんだシェイク）＆仙台朝市散策',
    loc1: 'ずんだ茶寮 仙台駅ずんだ小径店',
    spot2: '日本三景・松島湾遊覧船クルーズ＆松島さかな市場で焼き牡蠣',
    loc2: '松島島巡り観光船企業組合',
    spot3: '瑞巌寺・五大堂参拝と観瀾亭でお抹茶体験',
    loc3: '瑞巌寺',
    spot4: '旨味太助（元祖・炭火焼き厚切り牛たんディナー）＆仙台市内温泉付きホテル',
    loc4: '旨味太助',
    dinnerNote: '【🍽️夕食提案：外食で本場の炭火焼き牛たんへ！】仙台駅・国分町周辺には「旨味太助」や「閣」など牛たんの名店が集まっているため、夜は外食にして焼きたてを味わうのがおすすめです。',
    cover: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80',
    subPhoto: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'
  }
];

const buildAutoPilotWeeklyCourse = (seedOffset = 0) => {
  const now = new Date();
  // 全ユーザーの端末で100%同じ週番号・同じ日付になるようUTC基準の週番号を使用（乱数は一切使わない）
  const weekNumber = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000)) + seedOffset;
  const month = now.getMonth() + 1;
  const seasonLabel = month >= 3 && month <= 5 ? '春のおすすめ' : month >= 6 && month <= 8 ? '夏のおすすめ' : month >= 9 && month <= 11 ? '秋のおすすめ' : '冬のおすすめ';
  const target = AUTO_SEASONAL_DESTINATIONS[Math.abs(weekNumber) % AUTO_SEASONAL_DESTINATIONS.length];

  // 週の基準日から固定で算出するため、誰がいつ開いても全員同じ日付・同じID・同じ内容になる
  const weekBaseMs = (weekNumber - seedOffset) * (7 * 24 * 60 * 60 * 1000);
  const pastD1 = new Date(weekBaseMs - (21 * 24 * 60 * 60 * 1000));
  const pastD2 = new Date(pastD1.getTime() + (24 * 60 * 60 * 1000));
  const d1Str = pastD1.toISOString().split('T')[0];
  const d2Str = pastD2.toISOString().split('T')[0];

  return {
    id: `PUB-AUTO-${weekNumber}`,
    isAutoGenerated: true,
    title: `【${seasonLabel}・公式自動厳選】${target.dest} 王道＆グルメ満喫1泊2日`,
    description: `季節とトレンドに合わせて自動セレクトされた${target.dest}の実録モデルコース！${target.spot1}から${target.spot3}まで具体的な名店・観光地を効率よく巡れます。`,
    destination: target.dest.split('・')[0],
    region: target.region,
    authorId: OFFICIAL_ACCOUNT_PROFILE.id,
    authorName: OFFICIAL_ACCOUNT_PROFILE.name,
    authorBio: OFFICIAL_ACCOUNT_PROFILE.bio,
    likes: 260 + ((weekNumber * 17) % 190),
    views: 1400 + ((weekNumber * 53) % 900),
    likedBy: [],
    covers: [target.cover, target.subPhoto],
    startDate: d1Str,
    endDate: d2Str,
    budget: 27800,
    publishedAt: weekBaseMs,
    members: [{ id: OFFICIAL_ACCOUNT_PROFILE.id, name: OFFICIAL_ACCOUNT_PROFILE.name, color: '#7A9D8C', isOfficial: true }],
    comments: [],
    events: [
      { id: `auto_${weekNumber}_1`, date: d1Str, time: '10:30', title: target.spot1, type: 'meal', cost: 1800, status: 'approved', authorId: OFFICIAL_ACCOUNT_PROFILE.id, location: target.loc1, memo: '到着したらまずは名物グルメの食べ歩きと人気カフェでひと休み！', photos: [{ id: `pa_${weekNumber}_1`, url: target.subPhoto, authorId: OFFICIAL_ACCOUNT_PROFILE.id, authorName: 'たびたび公式', isPublic: true }] },
      { id: `auto_${weekNumber}_2`, date: d1Str, time: '13:30', title: target.spot2, type: 'sightseeing', cost: 1200, status: 'approved', authorId: OFFICIAL_ACCOUNT_PROFILE.id, location: target.loc2, memo: '歴史と自然を感じる定番の名所。午前〜昼過ぎの時間帯が写真撮影におすすめです。', photos: [{ id: `pa_${weekNumber}_2`, url: target.cover, authorId: OFFICIAL_ACCOUNT_PROFILE.id, authorName: 'たびたび公式', isPublic: true }] },
      { id: `auto_${weekNumber}_3`, date: d1Str, time: '18:00', title: target.spot4, type: 'hotel', cost: 19000, status: 'approved', authorId: OFFICIAL_ACCOUNT_PROFILE.id, location: target.loc4, memo: target.dinnerNote, photos: [] },
      { id: `auto_${weekNumber}_4`, date: d2Str, time: '11:00', title: target.spot3, type: 'sightseeing', cost: 5800, status: 'approved', authorId: OFFICIAL_ACCOUNT_PROFILE.id, location: target.loc3, memo: '2日目は絶景ルートとご当地ランチを満喫して帰路へ！', photos: [] }
    ]
  };
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
    autoMinimizeTrip: user.autoMinimizeTrip !== undefined ? user.autoMinimizeTrip : true
  };
};

const sanitizePublicTrips = (list) => {
  if (!Array.isArray(list) || list.length === 0) return initialPublicTrips;
  const allPresets = [...initialPublicTrips, ...EXTRA_PUBLIC_TRIP_TEMPLATES];
  const mergedList = [...list];
  initialPublicTrips.forEach(preset => {
    if (!mergedList.some(item => item.id === preset.id || item.title === preset.title)) {
      mergedList.push(preset);
    }
  });
  return mergedList.map((t, idx) => {
    const fallbackAuthorId = t.authorName === 'アクティブ夫婦' ? 'm1' : t.authorName === 'たびたろう' ? 'm2' : t.authorName === 'くいしんぼう' ? 'm3' : `author_${idx}`;
    const presetMatch = allPresets.find(p => (p.id && p.id === t.id) || p.title === t.title);

    // プリセットの公式モデルコースの場合は、過去の旅行予定日（startDate / endDate）と写真付きイベントに強制同期して古いキャッシュを上書きする
    const resolvedStartDate = presetMatch?.startDate || t.startDate || '2025-10-18';
    const resolvedEndDate = presetMatch?.endDate || t.endDate || resolvedStartDate;

    const resolvedEvents = presetMatch
      ? presetMatch.events.map(ev => ({ ...ev }))
      : (Array.isArray(t.events) ? t.events : []);
    const eventsTotalCost = resolvedEvents.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
    return {
      ...t,
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
      authorId: t.authorId || t.members?.[0]?.id || fallbackAuthorId,
      likedBy: Array.isArray(t.likedBy) ? t.likedBy : [],
      comments: Array.isArray(t.comments) ? t.comments : [],
      covers: Array.isArray(t.covers) && t.covers.length > 0 ? t.covers : (presetMatch?.covers || (Array.isArray(t.images) ? t.images : [])),
      events: resolvedEvents,
      budget: eventsTotalCost > 0 ? eventsTotalCost : (t.budget || 0)
    };
  });
};

let globalSetToast = null;
const customAlert = (msg) => { if (globalSetToast) globalSetToast(msg); };

const copyToClipboard = (text, successMessage) => {
  const fallbackCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const ok = document.execCommand('copy');
      if (ok) customAlert(successMessage);
      else customAlert('コピーできませんでした。コードを長押し・選択してコピーしてください');
    } catch (e) {
      customAlert('コピーできませんでした。コードを長押し・選択してコピーしてください');
    }
    textArea.remove();
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      customAlert(successMessage);
    }).catch(() => {
      fallbackCopy();
    });
  } else {
    fallbackCopy();
  }
};

const generateSuggests = (baseName, emailBase) => {
  let base = baseName.trim() ? baseName : (emailBase || '');
  const kanaMap = {'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko','さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to','な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho','ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo','ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'wo','ん':'n','ー':'-'};
  let romaji = ''; for(let c of base){ romaji += kanaMap[c] || c; }
  romaji = romaji.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
  return [`${romaji}_${Math.floor(Math.random()*1000)}`, `${romaji}_travel`, `tabi_${romaji}`];
};

// 駅データAPI（HeartRails Express）を組み込んだ検索コンポーネント
function StationSearchInput({ value, onChange, cityContext = '', prefectureContext = '' }) {
  const [query, setQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setQuery(value); }, [value]);

  const kanaToHira = (str) => str.replace(/[\u30a1-\u30f6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60));

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
        let apiUrl = `https://express.heartrails.com/api/json?method=getStations&name=${encodeURIComponent(searchWord)}`;
        if (prefectureContext && prefectureContext !== '未設定') {
          apiUrl += `&prefecture=${encodeURIComponent(prefectureContext)}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data?.response?.station && data.response.station.length > 0) {
          const sorted = [...data.response.station].sort((a, b) => {
            if (!cityContext) return 0;
            const aMatch = (a.postal || '').includes(cityContext) || (a.prefecture || '').includes(cityContext) ? 1 : 0;
            const bMatch = (b.postal || '').includes(cityContext) || (b.prefecture || '').includes(cityContext) ? 1 : 0;
            return bMatch - aMatch;
          });
          const formatted = sorted.map(s => `${s.name}駅 (${s.line} / ${s.prefecture})`);
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
    const localMatches = MOCK_STATIONS.filter(s =>
      s.name.includes(val) || s.yomi.includes(lowerVal) || s.yomi.includes(hiraVal)
    ).map(s => s.name);

    const results = localMatches.length > 0 ? localMatches : [`${val.replace(/駅$/, '')}駅`];
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
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
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
  if (user?.isOfficial || user?.id === OFFICIAL_ACCOUNT_PROFILE.id) {
    return (
      <div className={`${size} rounded-full border-2 border-white bg-gradient-to-br from-[#7A9D8C] to-[#4A6B5B] text-white flex items-center justify-center shadow-sm shrink-0`}>
        <Compass size={14} className="stroke-[2.5]" />
      </div>
    );
  }
  if (user?.avatar) return <img src={user.avatar} alt="avatar" className={`${size} rounded-full object-cover border-2 border-white shadow-sm bg-stone-100 shrink-0`} />;
  return <div className={`${size} rounded-full border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0`} style={{ backgroundColor: user?.color || '#7A9D8C' }}>{user?.name?.charAt(0) || '👤'}</div>;
};

// 公式アカウント専用の認証バッジ付きアバター
const OfficialBrandAvatar = ({ size = 'w-10 h-10', iconSize = 18 }) => (
  <div className="relative shrink-0">
    <div className={`${size} rounded-2xl bg-gradient-to-br from-[#7A9D8C] via-[#5E8271] to-[#436052] text-white flex items-center justify-center shadow-sm border-2 border-white`}>
      <Compass size={iconSize} className="stroke-[2.4]" />
    </div>
    <span
      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center border-2 border-white shadow-2xs"
      title="公式認証アカウント"
    >
      <Check size={9} strokeWidth={4} />
    </span>
  </div>
);

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
  autoMinimizeTrip: true
};

// デフォルトのサンプル旅行を空に設定
const INITIAL_SAMPLE_TRIPS = [];

function TabitabiApp() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sanitizeUser(safeParse('tabitabi_user', null));
    if (saved) return saved;
    return DEV_AUTO_LOGIN ? DEV_DEFAULT_USER : null;
  });
  const [trips, setTrips] = useState(() => {
    const saved = safeParse('tabitabi_trips', null);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_SAMPLE_TRIPS;
  });
  const [publicTrips, setPublicTrips] = useState(() => sanitizePublicTrips(safeParse('tabitabi_public_trips', initialPublicTrips)));
  const [notifications, setNotifications] = useState(() => {
    const saved = safeParse('tabitabi_notifications', initialNotifications);
    return Array.isArray(saved)
      ? saved.filter(n => n.id !== 'n1' && n.message !== '温泉ボーイさんがあなたの旅にいいねしました。')
      : initialNotifications;
  });
  const [refreshCount, setRefreshCount] = useState(0);
  
  const [activeTripId, setActiveTripId] = useState(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [minimizedTripId, setMinimizedTripId] = useState(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [dashboardState, setDashboardState] = useState({
    activeTab: 'my',
    discoverSort: 'trending',
    selectedRegion: 'すべて',
    searchQuery: '',
    scrollTop: 0,
    windowScrollY: 0
  });

  useEffect(() => {
    globalSetToast = (msg) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3200);
    };
    return () => { globalSetToast = null; };
  }, []);

  // ★ ネット経由で全ユーザーの端末に同じ公式投稿・SNS投稿を配信するクラウド同期関数
  // 1) OFFICIAL_FEED_REMOTE_URL（Supabaseのpublic_tripsテーブルやGitHubのJSON）が設定されていればネットから全員同じ一覧を取得
  // 2) バックエンド未接続時でも、全ユーザーの端末で100%同じ週替わりコースが同じ順番で表示される決定論的同期を実行
  const fetchRemoteOfficialFeed = async (silent = true) => {
    const weeklyAutoCourse = buildAutoPilotWeeklyCourse(0);

    if (OFFICIAL_FEED_REMOTE_URL) {
      try {
        const res = await fetch(OFFICIAL_FEED_REMOTE_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        const remoteList = Array.isArray(data) ? data : (Array.isArray(data?.trips) ? data.trips : null);
        if (remoteList && remoteList.length > 0) {
          setPublicTrips(sanitizePublicTrips([weeklyAutoCourse, ...remoteList]));
          if (!silent) customAlert('最新の公式ガイドを同期しました！');
          return true;
        }
      } catch (e) {
        // 通信オフライン時は共通シードのフォールバックへ進む
      }
    }

    // 全ユーザーの端末でまったく同じラインナップ・同じ並び順になるよう同期
    setPublicTrips(prev => {
      const myLikedIds = new Set(
        (prev || [])
          .filter(t => Array.isArray(t.likedBy) && t.likedBy.includes(currentUser?.id))
          .map(t => t.id)
      );
      const baseFeed = [weeklyAutoCourse, ...initialPublicTrips];
      return baseFeed.map(trip => {
        const existing = (prev || []).find(p => p.id === trip.id);
        const isLiked = myLikedIds.has(trip.id);
        return {
          ...trip,
          likes: existing?.likes ?? trip.likes,
          likedBy: isLiked ? [currentUser?.id] : []
        };
      });
    });

    if (!silent) customAlert('最新の公式ガイドに同期しました！');
    return true;
  };

  useEffect(() => {
    fetchRemoteOfficialFeed(true);
  }, []);

  useEffect(() => {
    if (currentUser) localStorage.setItem('tabitabi_user', JSON.stringify(currentUser)); else localStorage.removeItem('tabitabi_user');
    localStorage.setItem('tabitabi_trips', JSON.stringify(trips));
    localStorage.setItem('tabitabi_public_trips', JSON.stringify(publicTrips));
    localStorage.setItem('tabitabi_notifications', JSON.stringify(notifications));
  }, [currentUser, trips, publicTrips, notifications]);

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;

  let activeTrip = trips.find(t => t.id === activeTripId);
  if (!activeTrip && isReadOnlyMode) activeTrip = publicTrips.find(t => t.id === activeTripId);
  const minimizedTrip = trips.find(t => t.id === minimizedTripId) || null;

  if (activeTripId && !activeTrip) {
    setActiveTripId(null);
    return null;
  }

  const handleBackFromTrip = () => {
    if (!isReadOnlyMode && activeTrip && currentUser?.autoMinimizeTrip !== false) {
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
    customAlert(nextVal ? 'しおりを閉じたときの自動ミニ化をONにしました' : 'しおりを閉じたときの自動ミニ化をOFFにしました');
  };

  const handlePublishTrip = (publishedData) => setPublicTrips([publishedData, ...publicTrips]);

  const toggleLike = (tripId) => {
    if (currentUser.isGuest) { customAlert('「いいね」をするにはアカウント登録が必要です。\n右上のアイコンから登録してください！'); return; }
    setPublicTrips(publicTrips.map(t => {
      if (t.id === tripId) {
        const hasLiked = t.likedBy?.includes(currentUser.id);
        return { ...t, likes: hasLiked ? t.likes - 1 : t.likes + 1, likedBy: hasLiked ? (t.likedBy || []).filter(id => id !== currentUser.id) : [...(t.likedBy || []), currentUser.id] };
      }
      return t;
    }));
  };

  const handleAddComment = (tripId, text) => {
    if (currentUser.isGuest) { customAlert('コメントするにはアカウント登録が必要です。'); return; }
    setPublicTrips(publicTrips.map(t => {
      if (t.id === tripId) return { ...t, comments: [...(t.comments || []), { id: generateId(), text, authorId: currentUser.id, authorName: currentUser.name, authorAvatar: currentUser.avatar, createdAt: Date.now() }] };
      return t;
    }));
  };

  const upgradeGuestUser = (newUserData) => {
    setCurrentUser(newUserData);
    const updatedTrips = trips.map(t => ({ ...t, members: (t.members || []).map(m => m.id === currentUser.id ? { ...newUserData, color: m.color } : m) }));
    setTrips(updatedTrips);
  };

  const handleToggleFollow = (targetAuthorId, targetAuthorName) => {
    if (!targetAuthorId) return;
    if (currentUser.isGuest) {
      customAlert('フォローするにはアカウント登録が必要です。');
      return;
    }
    if (targetAuthorId === currentUser.id) return;

    const followingList = Array.isArray(currentUser.following) ? currentUser.following : [];
    const isFollowing = followingList.includes(targetAuthorId);
    const nextFollowing = isFollowing
      ? followingList.filter(id => id !== targetAuthorId)
      : [...followingList, targetAuthorId];

    setCurrentUser({ ...currentUser, following: nextFollowing });
    customAlert(isFollowing ? `${targetAuthorName || 'ユーザー'}のフォローを解除しました` : `${targetAuthorName || 'ユーザー'}をフォローしました！`);
  };

  // X風の「引っ張って更新」：端末ごとにバラバラな乱数投稿を作るのではなく、サーバー上の最新フィードと全員同じ状態に同期する
  const handleRefreshPublicTrips = async () => {
    await fetchRemoteOfficialFeed(false);
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="h-[100dvh] w-full font-sans flex justify-center bg-stone-300 text-stone-800 antialiased selection:bg-[#7A9D8C]/20 overflow-hidden">
      <div className="w-full max-w-md h-[100dvh] relative shadow-2xl flex flex-col overflow-hidden bg-[#F4F7F5]">
        {toastMsg && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 w-11/12 max-w-[350px] bg-stone-800/95 text-white px-5 py-3 rounded-2xl shadow-xl z-[9999] text-xs font-bold animate-in slide-in-from-top-4 fade-in duration-300 whitespace-pre-wrap text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-[#7A9D8C]" />{toastMsg}
          </div>
        )}
        <div className={activeTripId ? 'hidden' : 'flex-1 flex flex-col h-full overflow-hidden'}>
          <Dashboard 
            currentUser={currentUser} onUpgradeUser={upgradeGuestUser} onLogout={() => setCurrentUser(null)}
            trips={trips} publicTrips={publicTrips} setPublicTrips={setPublicTrips} setTrips={setTrips}
            dashboardState={dashboardState} setDashboardState={setDashboardState}
            onOpenTrip={(id, readOnly = false) => { setIsReadOnlyMode(readOnly); setActiveTripId(id); }} 
            onToggleLike={toggleLike} onToggleFollow={handleToggleFollow} onEnlargeImage={setEnlargedImageUrl}
            onRefreshPublicTrips={handleRefreshPublicTrips}
            notifications={notifications} setNotifications={setNotifications} onAddComment={handleAddComment}
            onCopySave={(newTrip, updatedTrip) => {
              if (newTrip) {
                setTrips([newTrip, ...trips]);
                setDashboardState(prev => ({ ...prev, activeTab: 'my' }));
                setIsReadOnlyMode(false);
                setActiveTripId(newTrip.id);
                customAlert(newTrip.isSoloTrip ? '👤 1人旅のしおりとしてコピーしました！' : '👥 みんなの旅のしおりとしてコピーしました！');
              } else if (updatedTrip) {
                setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
                setDashboardState(prev => ({ ...prev, activeTab: 'my' }));
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
            currentUser={currentUser} trip={activeTrip} isReadOnly={isReadOnlyMode} myTrips={trips}
            updateTrip={(updatedTrip) => { if (!isReadOnlyMode) setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t)); }}
            onDeleteTrip={(tripIdToDelete) => {
              setTrips(trips.filter(t => t.id !== tripIdToDelete));
              if (minimizedTripId === tripIdToDelete) setMinimizedTripId(null);
              setActiveTripId(null);
              customAlert('しおりを削除しました');
            }}
            onToggleAutoMinimize={handleToggleAutoMinimize}
            onPublish={handlePublishTrip} onBack={handleBackFromTrip} onEnlargeImage={setEnlargedImageUrl}
            onCopySave={(newTrip, updatedTrip) => {
              if (newTrip) {
                setTrips([newTrip, ...trips]);
                setDashboardState(prev => ({ ...prev, activeTab: 'my' }));
                setIsReadOnlyMode(false);
                setActiveTripId(newTrip.id);
                customAlert(newTrip.isSoloTrip ? '👤 1人旅のしおりとしてコピーしました！' : '👥 みんなの旅のしおりとしてコピーしました！');
              } else if (updatedTrip) {
                setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
                setDashboardState(prev => ({ ...prev, activeTab: 'my' }));
                setIsReadOnlyMode(false);
                setActiveTripId(updatedTrip.id);
                customAlert('予定を自分のしおりにコピーしました！');
              }
            }}
            onOpenAuthUpgrade={() => {
              setActiveTripId(null);
              customAlert('右上のプロフィールアイコンから無料アカウント登録ができます！');
            }}
            onAddComment={handleAddComment}
          />
        )}

        {/* LINEのマルチタスクアイコンのように画面のどこにでもドラッグ配置できるミニしおりアイコン */}
        {minimizedTrip && (activeTripId !== minimizedTrip.id || isReadOnlyMode) && (
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
          <div className="fixed inset-0 bg-black/85 z-[300] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEnlargedImageUrl(null)}>
            <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"><X size={22} /></button>
            <div className="max-w-md w-full max-h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <img src={enlargedImageUrl} alt="Enlarged view" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl animate-in zoom-in-95" />
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
    moved: false
  });

  useEffect(() => {
    const parent = bubbleRef.current?.parentElement;
    if (parent) {
      const initX = Math.max(12, parent.clientWidth - 88);
      const initY = Math.max(90, Math.min(parent.clientHeight - 170, Math.round(parent.clientHeight * 0.62)));
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
      moved: false
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
    const nextY = Math.max(56, Math.min(maxH, dragInfoRef.current.originY + dy));
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
        touchAction: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className={`absolute z-[180] select-none ${
        isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab transition-transform duration-150 hover:scale-105'
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
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-stone-500 flex items-center justify-center shadow-md border border-stone-200 hover:bg-rose-50 hover:text-rose-500 transition-colors z-10"
          title="ミニアイコンを閉じる"
        >
          <X size={12} strokeWidth={2.8} />
        </button>

        {/* 可愛いパステル・トラベルタグ風のフローティングアイコン本体 */}
        <button
          type="button"
          onClick={handleClickMain}
          className="w-[72px] h-[72px] rounded-[26px] bg-gradient-to-br from-[#FFFDFB] via-[#FFF3EC] to-[#FCE4D8] text-stone-700 shadow-[0_8px_24px_-4px_rgba(226,149,120,0.45)] border-2 border-white ring-1 ring-[#E2A98B]/40 flex flex-col items-center justify-center p-1.5 relative overflow-hidden active:scale-95"
          title="タップして自分のしおりを開く（ドラッグで移動）"
        >
          <div className="w-7 h-7 rounded-2xl bg-gradient-to-br from-[#E29578] to-[#D67D5C] text-white flex items-center justify-center shadow-xs mb-1 shrink-0">
            <Compass size={15} className="stroke-[2.4]" />
          </div>
          <span className="text-[8px] font-extrabold text-[#C86D4E] tracking-tight leading-none mb-0.5">
            {isViewingOtherTrip ? '✈️ 自分の旅へ' : '📒 しおり中'}
          </span>
          <span className="text-[9px] font-extrabold text-stone-700 leading-tight w-full truncate text-center px-1">
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
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [userId, setUserId] = useState('');
  const [residence, setResidence] = useState('未設定'); const [city, setCity] = useState(''); const [station, setStation] = useState('');
  const [avatar, setAvatar] = useState(FEMALE_AVATARS[0]); const [customAvatar, setCustomAvatar] = useState(null);
  const [suggestedIds, setSuggestedIds] = useState([]);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const fileInputRef = useRef(null);

  const isIdTaken = ['admin', 'test', 'user'].includes((userId || '').toLowerCase());

  useEffect(() => {
    const timeout = setTimeout(() => { if (name || email) setSuggestedIds(generateSuggests(name, email.split('@')[0])); }, 500);
    return () => clearTimeout(timeout);
  }, [name, email]);

  const handleNext = () => {
    if (!email || !password) { customAlert('メールアドレスとパスワードを入力してください'); return; }
    if (isLogin) onLogin({ id: 'user123', name: 'テストユーザー', email, password, passkeys: [], avatar: FEMALE_AVATARS[0], isGuest: false, following: ['m1'], followers: [] });
    else setStep(2);
  };

  const handlePasskeyLogin = () => {
    customAlert('パスキー（生体認証）で認証しました！');
    onLogin({
      id: 'user123',
      name: 'テストユーザー',
      email: email || 'user@example.com',
      password: 'password123',
      passkeys: [{ id: 'pk_default', name: 'このデバイスのパスキー', createdAt: new Date().toLocaleDateString() }],
      avatar: FEMALE_AVATARS[0],
      isGuest: false,
      following: ['m1'],
      followers: []
    });
  };

  const handleRegister = () => {
    if (!name || !userId || isIdTaken) { customAlert('ニックネームと有効なIDを入力してください'); return; }
    onLogin({ id: userId, name, email, password, passkeys: [], residence, city, station, avatar: customAvatar || avatar, isGuest: false, following: ['m1'], followers: [] });
  };

  const handleGuest = () => {
    onLogin({ id: generateId(), name: 'ゲストユーザー', isGuest: true, avatar: FEMALE_AVATARS[0], following: [], followers: ['m2'] });
  };

  // ★ Google / Apple 外部サービスによるワンタップログイン・新規登録ハンドラー
  const handleOAuthLogin = (providerName) => {
    const isGoogle = providerName === 'Google';
    customAlert(`${providerName}アカウントで認証しました！`);
    onLogin({
      id: isGoogle ? 'google_user_' + Math.floor(Math.random() * 900 + 100) : 'apple_user_' + Math.floor(Math.random() * 900 + 100),
      name: isGoogle ? 'Googleユーザー' : 'Appleユーザー',
      email: isGoogle ? 'traveler@gmail.com' : 'traveler@privaterelay.appleid.com',
      authProvider: providerName,
      password: '',
      passkeys: [],
      residence: '未設定',
      city: '',
      station: '',
      avatar: isGoogle ? FEMALE_AVATARS[1] : MALE_AVATARS[0],
      isGuest: false,
      following: ['m1'],
      followers: []
    });
  };

  return (
    <div className="min-h-screen bg-stone-300 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-6"><h1 className="text-3xl font-extrabold text-[#7A9D8C] tracking-widest mb-2">たびたび</h1><p className="text-xs text-stone-500 font-bold">みんなの旅行計画アプリ</p></div>

        {step === 'forgot' ? (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="font-bold text-stone-800 text-lg mb-2 text-center">パスワードの再設定</h2>
            {forgotStep === 1 ? (
              <>
                <p className="text-xs text-stone-500 text-center mb-5 leading-relaxed">
                  ご登録のメールアドレスを入力してください。<br />パスワード再設定用の認証コードをお送りします。
                </p>
                <div className="mb-5">
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">登録メールアドレス</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    placeholder="mail@example.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!resetEmail.trim()) { customAlert('メールアドレスを入力してください'); return; }
                    customAlert(`${resetEmail} 宛に認証コード（123456）を送信しました`);
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
                  {resetEmail} に送信された6桁のコードと<br />新しいパスワードを入力してください
                </div>
                <div className="space-y-3.5 mb-5">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">認証コード（6桁）</label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value)}
                      placeholder="例: 123456"
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">新しいパスワード</label>
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={e => setResetNewPassword(e.target.value)}
                      placeholder="8文字以上の英数字"
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!resetCode.trim() || resetNewPassword.trim().length < 8) {
                      customAlert('認証コードと8文字以上の新しいパスワードを入力してください');
                      return;
                    }
                    customAlert('パスワードを再設定しました！新しいパスワードでログインしてください。');
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
              onClick={() => { setStep(1); setForgotStep(1); }}
              className="w-full py-2.5 text-xs font-bold text-stone-400 hover:text-stone-600"
            >
              ログイン画面に戻る
            </button>
          </div>
        ) : step === 1 ? (
          <div className="animate-in fade-in slide-in-from-left-4">
            <h2 className="font-bold text-stone-800 text-lg mb-4 text-center">{isLogin ? 'ログイン' : '新規アカウント作成'}</h2>

            {/* ★ Google / Apple 外部連携ログインボタン（App Store審査ガイドライン準拠で並べて配置） */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-extrabold rounded-2xl shadow-2xs text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
                  <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z" />
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.4 7.4 24 12 24z" />
                </svg>
                <span>Googleで{isLogin ? 'ログイン' : '登録して始める'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('Apple')}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-black text-white font-extrabold rounded-2xl shadow-2xs text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Appleで{isLogin ? 'ログイン' : '登録して始める'}</span>
              </button>
            </div>

            <div className="relative flex py-1.5 items-center mb-4">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-stone-400">またはメールアドレスで{isLogin ? 'ログイン' : '登録'}</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <div className="space-y-4 mb-5">
              <div><label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">メールアドレス</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]" placeholder="mail@example.com" /></div>
              <div>
                <div className="flex justify-between items-center mb-1 px-1">
                  <label className="text-[11px] font-bold text-stone-500">パスワード</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); setForgotStep(1); setStep('forgot'); }}
                      className="text-[11px] font-bold text-[#7A9D8C] hover:underline"
                    >
                      パスワードを忘れた方
                    </button>
                  )}
                </div>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]" placeholder="8文字以上の英数字" />
              </div>
            </div>
            <button onClick={handleNext} className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors mb-3">{isLogin ? 'メールアドレスでログイン' : '次へ（プロフィール設定）'}</button>
            {isLogin && (
              <button
                type="button"
                onClick={handlePasskeyLogin}
                className="w-full py-3 bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-2xl text-xs hover:bg-stone-200 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-amber-500" /> パスキー（生体認証）でログイン
              </button>
            )}
            <div className="text-center"><button onClick={() => setIsLogin(!isLogin)} className="text-xs text-stone-500 font-bold hover:text-[#7A9D8C] underline">{isLogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}</button></div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 max-h-[70vh] overflow-y-auto no-scrollbar pb-2">
            <h2 className="font-bold text-stone-800 text-lg mb-4 text-center">プロフィール設定</h2>
            
            <div className="mb-6 flex flex-col items-center">
              <p className="text-[11px] font-bold text-stone-500 mb-3 text-center bg-stone-100 px-3 py-1 rounded-full">初期アイコン、または自分の写真から選べます</p>
              <div className="relative w-24 h-24 mb-5">
                <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner text-stone-400 z-0 hover:bg-stone-100">
                  {customAvatar ? <img src={customAvatar} className="w-full h-full object-cover" alt="custom" /> : <div className="flex flex-col items-center"><Camera size={20} className="mb-1" /><span className="text-[9px] font-bold">写真を選ぶ</span></div>}
                </button>
                <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full border-[3px] border-white shadow-md bg-stone-100 z-10 overflow-hidden pointer-events-none"><img src={avatar} alt="preset" className="w-full h-full object-cover" /></div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={async (e) => { if(e.target.files?.[0]) { const compressed = await compressImageFile(e.target.files[0], 500, 0.85); setCustomAvatar(compressed); } }} className="hidden" />
              </div>
              <div className="w-full space-y-4">
                <div><p className="text-[10px] font-bold text-stone-400 mb-1.5 text-center">女性風アイコン</p><div className="flex justify-center gap-2">{FEMALE_AVATARS.map(url => (<button key={url} onClick={() => { setAvatar(url); setCustomAvatar(null); }} className={`w-10 h-10 rounded-full border-2 transition-all ${avatar === url && !customAvatar ? 'border-[#7A9D8C] scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={url} alt="female" className="w-full h-full rounded-full object-cover" /></button>))}</div></div>
                <div><p className="text-[10px] font-bold text-stone-400 mb-1.5 text-center">男性風アイコン</p><div className="flex justify-center gap-2">{MALE_AVATARS.map(url => (<button key={url} onClick={() => { setAvatar(url); setCustomAvatar(null); }} className={`w-10 h-10 rounded-full border-2 transition-all ${avatar === url && !customAvatar ? 'border-[#7A9D8C] scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={url} alt="male" className="w-full h-full rounded-full object-cover" /></button>))}</div></div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div><label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">ニックネーム</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]" placeholder="例: たびたろう" /></div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">ユーザーID (半角英数字)</label>
                <div className="relative">
                  <input type="text" value={userId} onChange={e=>setUserId(e.target.value)} className={`w-full p-3 pr-10 bg-stone-50 border ${userId && isIdTaken ? 'border-red-300 focus:ring-red-400' : 'border-stone-200 focus:ring-[#7A9D8C]'} rounded-xl text-sm font-bold focus:outline-none focus:ring-2 font-mono`} placeholder="例: taro_123" />
                  {userId && <div className="absolute right-3 top-1/2 -translate-y-1/2">{isIdTaken ? <XCircle size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-[#7A9D8C]" />}</div>}
                </div>
                {suggestedIds.length > 0 && !userId && (<div className="mt-2 flex flex-wrap gap-1.5">{suggestedIds.map(id => (<button key={id} onClick={() => setUserId(id)} className="px-2 py-1 bg-stone-100 text-stone-600 rounded-lg text-[10px] font-mono hover:bg-stone-200 transition-colors">{id}</button>))}</div>)}
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">居住地・最寄り駅</label>
                <p className="text-[9px] text-stone-400 mb-2 leading-tight px-1">※公開されません。登録すると交通手段の検索が便利になります。</p>
                <div className="space-y-2">
                  <select value={residence} onChange={e=>setResidence(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]">
                    <option value="未設定">都道府県を選択 (未設定)</option>
                    {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="市区町村 (例: 渋谷区)" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]" />
                  <StationSearchInput value={station} onChange={setStation} cityContext={city} prefectureContext={residence} />
                </div>
              </div>
            </div>

            <button onClick={handleRegister} className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm hover:bg-[#688a79] transition-colors mb-3">登録して始める</button>
            <button onClick={() => setStep(1)} className="w-full py-3 text-xs font-bold text-stone-400 hover:text-stone-600">戻る</button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-stone-100 text-center flex flex-col items-center">
          <button onClick={handleGuest} className="text-[11px] font-bold text-stone-400 hover:text-stone-600 flex justify-center items-center gap-1 mx-auto mb-2"><User size={12} /> アカウントを作らずにゲストとして始める</button>
          <p className="text-[9px] text-stone-400 leading-tight">※ゲスト利用は一部機能が制限されます。後から引き継ぎ可能です。</p>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// Dashboard
// ------------------------------------------
function Dashboard({ currentUser, onUpgradeUser, onLogout, trips, publicTrips, setPublicTrips, setTrips, dashboardState, setDashboardState, onOpenTrip, onToggleLike, onToggleFollow, onEnlargeImage, onRefreshPublicTrips, notifications, setNotifications, onAddComment, onCopySave, isHidden }) {
  const activeTab = dashboardState?.activeTab || 'my';
  const setActiveTab = (tab) => {
    setHideChrome(false);
    setDashboardState(prev => ({ ...prev, activeTab: tab, scrollTop: 0, windowScrollY: 0 }));
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);
  const [dashboardCopyTarget, setDashboardCopyTarget] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // X（旧Twitter）風のスクロール連動：下にスクロールで上下バーを隠し、上にスクロールで即座に表示
  const [hideChrome, setHideChrome] = useState(false);
  const lastScrollYRef = useRef(0);
  const lastToggleTimeRef = useRef(0);
  const scrollContainerRef = useRef(null);

  const isAnyDashboardModalOpen = Boolean(
    showCreateModal || showJoinModal || showProfileModal || showNotifications || viewingUserProfile || dashboardCopyTarget
  );

  const handleFeedScroll = (e) => {
    if (isAnyDashboardModalOpen) return;
    const el = e.currentTarget;
    const currentY = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const delta = currentY - lastScrollYRef.current;
    const now = Date.now();

    // スクロールバーの上下端バウンスやレイアウト変化によるガタつき・無限ループを防止（クールダウン260ms）
    if (currentY <= 24) {
      if (hideChrome) {
        setHideChrome(false);
        lastToggleTimeRef.current = now;
      }
      lastScrollYRef.current = currentY;
      return;
    }

    if (maxScroll - currentY <= 36) {
      lastScrollYRef.current = currentY;
      return;
    }

    if (now - lastToggleTimeRef.current < 260) {
      lastScrollYRef.current = currentY;
      return;
    }

    if (delta > 16 && currentY > 72 && !isFilterOpen) {
      if (!hideChrome) {
        setHideChrome(true);
        lastToggleTimeRef.current = now;
      }
    } else if (delta < -14) {
      if (hideChrome) {
        setHideChrome(false);
        lastToggleTimeRef.current = now;
      }
    }
    lastScrollYRef.current = currentY;
  };

  useEffect(() => {
    if (!isHidden) {
      setHideChrome(false);
      if (scrollContainerRef.current && dashboardState?.scrollTop !== undefined) {
        scrollContainerRef.current.scrollTop = dashboardState.scrollTop;
      }
      if (typeof window !== 'undefined' && dashboardState?.windowScrollY !== undefined) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: dashboardState.windowScrollY, behavior: 'instant' });
        });
      }
    }
  }, [isHidden]);

  const handleOpenTripWithScroll = (id, readOnly = false) => {
    const currentScroll = scrollContainerRef.current ? scrollContainerRef.current.scrollTop : 0;
    const currentWinY = typeof window !== 'undefined' ? window.scrollY : 0;
    setDashboardState(prev => ({ ...prev, scrollTop: currentScroll, windowScrollY: currentWinY }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    onOpenTrip(id, readOnly);
  };

  const todayStr = getTodayString();
  const upcomingTrips = useMemo(() => (trips || []).filter(t => (t.endDate || '') >= todayStr).sort((a, b) => (a.startDate || '').localeCompare(b.startDate || '')), [trips, todayStr]);
  const pastTrips = useMemo(() => (trips || []).filter(t => (t.endDate || '') < todayStr).sort((a, b) => (b.endDate || '').localeCompare(a.endDate || '')), [trips, todayStr]);

  const isFilterActive = (dashboardState?.selectedRegion && dashboardState.selectedRegion !== 'すべて') || Boolean((dashboardState?.searchQuery || '').trim());

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F4F7F5]">
      {/* ① X風の超コンパクトな上部ヘッダー（下スクロールでスッと隠れ、上スクロールで即表示） */}
      <header
        className={`bg-white/95 backdrop-blur-md px-4 border-b border-stone-200/70 z-30 shrink-0 transition-all duration-300 overflow-hidden ${
          hideChrome
            ? 'max-h-0 py-0 opacity-0 -translate-y-full border-none pointer-events-none'
            : 'max-h-20 pt-2.5 pb-2 opacity-100 translate-y-0'
        }`}
      >
        <div className="flex justify-between items-center h-9">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="relative group transition-transform active:scale-95 outline-none"
              title="プロフィール・設定"
            >
              <UserAvatar user={currentUser} size="w-8 h-8" />
              {currentUser.isGuest && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                </span>
              )}
            </button>
            <span className="font-extrabold tracking-widest text-lg text-[#7A9D8C]">たびたび</span>
          </div>

          <div className="flex items-center gap-1">
            {/* みんなの旅タブ表示中は右上にコンパクトな検索トグルを表示 */}
            {activeTab === 'discover' && (
              <button
                type="button"
                onClick={() => {
                  setHideChrome(false);
                  setIsFilterOpen(prev => !prev);
                }}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-all active:scale-95 ${
                  isFilterOpen || Boolean((dashboardState?.searchQuery || '').trim())
                    ? 'bg-[#7A9D8C]/15 border-[#7A9D8C] text-[#557465]'
                    : 'bg-stone-100/90 border-transparent text-stone-600 hover:bg-stone-200/70'
                }`}
                title="キーワード検索"
              >
                <Search size={13} className={isFilterOpen || Boolean((dashboardState?.searchQuery || '').trim()) ? 'text-[#7A9D8C]' : 'text-stone-500'} />
                <span>
                  {Boolean((dashboardState?.searchQuery || '').trim())
                    ? `「${dashboardState.searchQuery.slice(0, 6)}」`
                    : '検索'}
                </span>
                {Boolean((dashboardState?.searchQuery || '').trim()) && <span className="w-1.5 h-1.5 rounded-full bg-[#7A9D8C]" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setNotifications(notifications.map(n => ({ ...n, read: true })));
              }}
              className="relative p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
              title="お知らせ"
            >
              <Bell size={19} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="absolute top-12 right-4 w-72 bg-white rounded-2xl shadow-xl border border-stone-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="p-3 border-b border-stone-100 flex justify-between items-center">
            <h4 className="font-bold text-sm text-stone-800">お知らせ</h4>
            <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600"><X size={15} /></button>
          </div>
          <div className="max-h-64 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-400">通知はありません</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-3 border-b border-stone-50 text-xs ${!n.read ? 'bg-stone-50/80' : 'bg-white'}`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{n.type === 'like' ? <Heart size={14} className="text-red-500" /> : <MessageSquare size={14} className="text-[#7A9D8C]" />}</div>
                    <div>
                      <p className="text-stone-700 font-bold mb-0.5 leading-snug">{n.message}</p>
                      <p className="text-[9px] text-stone-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ② メインコンテンツ領域 */}
      <div
        ref={activeTab === 'my' ? scrollContainerRef : null}
        onScroll={activeTab === 'my' ? handleFeedScroll : undefined}
        className={`flex-1 bg-[#F4F7F5] ${activeTab === 'my' ? 'overflow-y-auto overscroll-y-contain no-scrollbar' : 'flex flex-col overflow-hidden'}`}
      >
        {activeTab === 'my' ? (
          <div className="px-5 py-4 pb-28 animate-in fade-in duration-300">
            <div className="flex gap-2.5 mb-5">
              <button onClick={() => setShowCreateModal(true)} className="flex-1 py-3 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-xs flex justify-center items-center gap-1.5 hover:bg-[#688a79] active:scale-[0.99] transition-all"><Plus size={16} /> 新しい旅</button>
              <button onClick={() => { if (currentUser.isGuest) { customAlert('ゲストモードでは、参加できません。'); return; } setShowJoinModal(true); }} className="flex-1 py-3 bg-white text-[#7A9D8C] border-2 border-[#7A9D8C] font-bold rounded-2xl shadow-sm text-xs flex justify-center items-center gap-1.5 hover:bg-stone-50 active:scale-[0.99] transition-all"><Check size={16} /> コードで参加</button>
            </div>
            {trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center"><div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 text-[#7A9D8C] rotate-6 border border-stone-100"><Compass size={36} strokeWidth={1.5} /></div><h3 className="text-base font-bold text-stone-800 mb-1">旅行のしおりがありません</h3><p className="text-xs text-stone-500">「新しい旅」を作るか、<br />友達の招待コードで参加しましょう。</p></div>
            ) : (
              <div className="flex flex-col gap-5">
                {upcomingTrips.length > 0 && (
                  <div className="flex flex-col gap-3"><h2 className="text-xs font-bold text-stone-400 mb-0.5 flex items-center gap-1.5"><Calendar size={14} /> これからの旅 ({upcomingTrips.length})</h2>{upcomingTrips.map(trip => <TripCard key={trip.id} trip={trip} onOpenTrip={handleOpenTripWithScroll} />)}</div>
                )}
                {pastTrips.length > 0 && (
                  <div className="flex flex-col gap-3"><h2 className="text-xs font-bold text-stone-400 mb-0.5 flex items-center gap-1.5"><Camera size={14} /> 過去の旅・思い出 ({pastTrips.length})</h2>{pastTrips.map(trip => <TripCard key={trip.id} trip={trip} onOpenTrip={handleOpenTripWithScroll} isPast />)}</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <DiscoverTab
            publicTrips={publicTrips}
            setPublicTrips={setPublicTrips}
            currentUser={currentUser}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
            onOpenTrip={handleOpenTripWithScroll}
            onCopyTrip={(tripToCopy) => setDashboardCopyTarget({ type: 'trip', data: tripToCopy })}
            onToggleLike={onToggleLike}
            onToggleFollow={onToggleFollow}
            onOpenUserProfile={setViewingUserProfile}
            onEnlargeImage={onEnlargeImage}
            onRefreshPublicTrips={onRefreshPublicTrips}
            onAddComment={onAddComment}
            scrollContainerRef={scrollContainerRef}
            hideChrome={hideChrome}
            onFeedScroll={handleFeedScroll}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
          />
        )}
      </div>

      {/* ③ LINE / X 風の下部ボトムナビゲーション（「自分たちの旅」と「みんなの旅」を下部に配置し、下スクロール時は連動して隠れる） */}
      <nav
        className={`bg-white/95 backdrop-blur-md border-t border-stone-200/80 flex justify-around items-center pb-safe z-30 shrink-0 transition-all duration-300 overflow-hidden ${
          hideChrome
            ? 'max-h-0 py-0 opacity-0 translate-y-full border-none pointer-events-none'
            : 'max-h-16 py-1.5 opacity-100 translate-y-0'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === 'my' ? 'text-[#7A9D8C]' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <div className={`px-3.5 py-0.5 rounded-full transition-colors ${activeTab === 'my' ? 'bg-[#7A9D8C]/15' : ''}`}>
            <Compass size={20} strokeWidth={activeTab === 'my' ? 2.6 : 2} />
          </div>
          <span className="text-[10px] font-extrabold tracking-tight">自分たちの旅</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeTab === 'discover' ? 'text-[#7A9D8C]' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <div className={`px-3.5 py-0.5 rounded-full transition-colors ${activeTab === 'discover' ? 'bg-[#7A9D8C]/15' : ''}`}>
            <Globe size={20} strokeWidth={activeTab === 'discover' ? 2.6 : 2} />
          </div>
          <span className="text-[10px] font-extrabold tracking-tight">みんなの旅</span>
        </button>
      </nav>

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
      {showJoinModal && <JoinTripWizard currentUser={currentUser} trips={trips} setTrips={setTrips} onClose={() => setShowJoinModal(false)} onOpenTrip={handleOpenTripWithScroll} />}
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
    <div onClick={() => onOpenTrip(trip.id, false)} className={`bg-white p-5 rounded-3xl shadow-sm cursor-pointer border border-stone-100 hover:shadow-md transition-all active:scale-[0.99] ${isPast ? 'opacity-85 grayscale-[15%]' : ''}`}>
      <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-base text-stone-800 pr-2 leading-snug">{trip.title}</h3>{trip.isSoloTrip && <span className="text-[10px] bg-stone-100 text-stone-500 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">👤 ひとり旅</span>}</div>
      <div className="flex items-center gap-3 text-xs font-medium text-stone-500 mb-3.5"><span className="flex items-center gap-1"><MapPin size={12} className="text-[#7A9D8C]" /> {trip.destination || '未設定'}</span><span className="flex items-center gap-1"><Calendar size={12} /> {trip.startDate.replace(/-/g, '/')}</span></div>
      <div className="flex -space-x-2 pt-1 border-t border-stone-50 items-center justify-between">
        <div className="flex -space-x-2">{(trip.members || []).map((m, i) => (<div key={m.id || i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden" style={{ backgroundColor: m.color, zIndex: 10 - i }} title={m.name}>{m.avatar ? <img src={m.avatar} alt="member" className="w-full h-full object-cover" /> : m.name.charAt(0)}</div>))}</div>
        <span className="text-[11px] font-bold text-stone-400 flex items-center gap-0.5">開く <ChevronRight size={14} /></span>
      </div>
    </div>
  );
}

function CreateTripWizard({ currentUser, onClose, onComplete }) {
  useLockBodyScroll(true);
  const [step, setStep] = useState(1);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAiEvents, setSelectedAiEvents] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInviteMsg, setCopiedInviteMsg] = useState(false);
  const tripCodeRef = useRef(generateTripCode());
  const myColor = PRESET_COLORS[0];

  const savedDepartures = useMemo(() => getSavedDeparturePoints(currentUser), [currentUser]);
  const defaultOrigin = savedDepartures[0] || '松本駅（自宅・最寄り駅）';

  const [tripData, setTripData] = useState({
    title: '',
    departurePoint: defaultOrigin,
    destination: '',
    transportMethod: 'shinkansen_train',
    transportPriority: 'cost',
    startDate: getTodayString(),
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    budget: 50000
  });
  const [saveOriginForNext, setSaveOriginForNext] = useState(false);

  const handleCreate = (isSolo = false) => {
    if (saveOriginForNext && tripData.departurePoint.trim()) {
      addSavedDeparturePoint(tripData.departurePoint.trim());
    }
    const initialEvents = (selectedAiEvents || []).map(ev => ({
      ...ev,
      id: generateId(),
      status: isSolo ? 'approved' : 'proposed',
      authorId: currentUser.id,
      photos: []
    }));
    onComplete({
      id: tripCodeRef.current,
      title: tripData.title || '新しい旅行',
      departurePoint: tripData.departurePoint.trim() || defaultOrigin,
      destination: tripData.destination || '行き先未定',
      transportMethod: tripData.transportMethod,
      transportPriority: tripData.transportPriority,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: Number(tripData.budget) || 50000,
      members: [{ ...currentUser, color: myColor }],
      isSoloTrip: isSolo,
      events: initialEvents,
      photos: []
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
    copyToClipboard(
      inviteText,
      'アプリ紹介URL付きの招待文をコピーしました！'
    );
    setCopiedInviteMsg(true);
    setTimeout(() => setCopiedInviteMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg text-stone-800">{step === 1 ? '新しい旅の基本情報' : 'メンバーの招待・共有コード'}</h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-100 via-sky-200/80 to-cyan-100 hover:from-sky-200/80 hover:to-cyan-200/80 text-sky-800 font-extrabold rounded-2xl shadow-xs border border-sky-300/70 text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <Sparkles size={15} className="text-sky-500" /> AIにおまかせでプランを提案してもらう
            </button>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">旅のタイトル</label>
              <input
                type="text"
                value={tripData.title}
                onChange={e => setTripData({ ...tripData, title: e.target.value })}
                placeholder="例: 秋の京都・グルメ旅"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
            </div>

            {/* ★ 出発地点（自宅の最寄り駅＋よく使う出発地の選択＆次回用に保存チェック） */}
            <div className="p-3 bg-stone-50/90 border border-stone-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                  <Navigation size={12} className="text-[#7A9D8C]" /> 出発地点（ 기본: 自宅・登録駅）
                </label>
                <span className="text-[10px] font-bold text-[#557465] bg-[#7A9D8C]/15 px-2 py-0.5 rounded-full">
                  プロフィール連動
                </span>
              </div>
              <input
                type="text"
                value={tripData.departurePoint}
                onChange={e => setTripData({ ...tripData, departurePoint: e.target.value })}
                placeholder="例: 松本駅 / 東京駅 / 羽田空港 / 自宅"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {savedDepartures.map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setTripData({ ...tripData, departurePoint: pt })}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all shrink-0 ${
                      tripData.departurePoint === pt
                        ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    📍 {pt}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={saveOriginForNext}
                  onChange={e => setSaveOriginForNext(e.target.checked)}
                  className="rounded accent-[#7A9D8C]"
                />
                <span>この出発地点を次の旅行でも使えるように保存しておく</span>
              </label>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">行き先（都道府県・エリア）</label>
              <input
                type="text"
                value={tripData.destination}
                onChange={e => setTripData({ ...tripData, destination: e.target.value })}
                placeholder="例: 京都府"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
            </div>

            {/* ★ 目的地までの主な移動方法＆重視ポイント */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-500 block pl-1">目的地までの移動方法</label>
              <div className="flex flex-wrap gap-1.5">
                {TRANSPORT_METHODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTripData({ ...tripData, transportMethod: m.id })}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                      tripData.transportMethod === m.id
                        ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {TRANSPORT_PRIORITIES.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTripData({ ...tripData, transportPriority: p.id })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tripData.transportPriority === p.id
                        ? 'bg-[#5E8473] text-white border-[#5E8473] shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold block">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">出発日</label>
                <input
                  type="date"
                  value={tripData.startDate}
                  onChange={e => setTripData({ ...tripData, startDate: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">最終日</label>
                <input
                  type="date"
                  value={tripData.endDate}
                  onChange={e => setTripData({ ...tripData, endDate: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">1人あたりの予算目安（円）</label>
              <input
                type="number"
                value={tripData.budget}
                onChange={e => setTripData({ ...tripData, budget: e.target.value })}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
            </div>

            {selectedAiEvents.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2">
                <Sparkles size={15} className="text-amber-500 shrink-0" />
                <span>AI提案の予定（{selectedAiEvents.length}件）が自動で追加されます！</span>
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
              <p className="text-xs font-bold text-[#7A9D8C] mb-2">しおりの共有・招待コード</p>
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
                <span>{copiedInviteMsg ? '招待文をコピーしました！' : 'アプリ紹介リンク付きで招待文をコピー'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              友達やパートナーにこのコードを共有すると、<br />一緒にしおりの予定を編集できるようになります。
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
              const isSolo = Boolean(currentUser.isGuest || plan.isSoloPlan);
              const planEvents = (plan.events || []).map(ev => ({
                ...ev,
                id: generateId(),
                status: isSolo ? 'approved' : 'proposed',
                authorId: currentUser.id,
                photos: []
              }));

              setShowAiModal(false);
              onComplete({
                id: tripCodeRef.current,
                title: plan.title || '新しい旅行',
                departurePoint: plan.departurePoint || tripData.departurePoint || defaultOrigin,
                destination: plan.destination || '行き先未定',
                transportMethod: plan.transportMethod || tripData.transportMethod,
                transportPriority: plan.transportPriority || tripData.transportPriority,
                startDate: plan.startDate,
                endDate: plan.endDate,
                budget: Number(plan.budget) || 50000,
                members: [{ ...currentUser, color: myColor }],
                isSoloTrip: isSolo,
                events: planEvents,
                photos: []
              });
              customAlert(
                isSolo
                  ? 'AI提案プランでしおりを作成しました！'
                  : `AI提案プランでしおりを作成しました！（招待コード: ${tripCodeRef.current}）`
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

function JoinTripWizard({ currentUser, trips, setTrips, onClose, onOpenTrip }) {
  useLockBodyScroll(true);
  const [step, setStep] = useState(1); const [joinCode, setJoinCode] = useState(''); const [foundTrip, setFoundTrip] = useState(null); const [myColor, setMyColor] = useState(PRESET_COLORS[1]);
  const handleCheckCode = () => {
    const code = joinCode.trim().toUpperCase(); if (!code) return;
    const existing = trips.find(t => t.id === code);
    if (existing) { setFoundTrip(existing); setStep(2); } else { setFoundTrip({ id: code, title: '友達の旅行計画', destination: '京都府', startDate: getTodayString(), endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], budget: 50000, members: [{ id: 'f1', name: '友達', color: PRESET_COLORS[0] }], isSoloTrip: false, events: [], photos: [] }); setStep(2); }
  };
  const handleJoin = () => {
    const isAlreadyMember = (foundTrip.members || []).some(m => m.id === currentUser.id);
    const updatedTrip = { ...foundTrip, isSoloTrip: false, members: isAlreadyMember ? foundTrip.members : [...(foundTrip.members || []), { ...currentUser, color: myColor }] };
    if (trips.some(t => t.id === updatedTrip.id)) setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t)); else setTrips([updatedTrip, ...trips]);
    onOpenTrip(updatedTrip.id, false); onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5"><h3 className="font-bold text-lg text-stone-800">{step === 1 ? 'コードで参加' : 'カラーの選択'}</h3><button onClick={onClose} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button></div>
        {step === 1 ? (
          <div><input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="例: TABI-XXXXXXXX" className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl uppercase font-mono text-center text-sm font-bold mb-5" /><button onClick={handleCheckCode} className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm">しおりを探す</button></div>
        ) : (
          <div><div className="mb-6"><label className="text-[11px] text-stone-500 font-bold mb-2 block text-center">あなたのメンバーカラー</label><div className="flex gap-2.5 justify-center">{PRESET_COLORS.map(color => (<button key={color} onClick={() => setMyColor(color)} className={`w-8 h-8 rounded-full transition-transform ${myColor === color ? 'scale-110 ring-2 ring-offset-2 ring-stone-700' : 'opacity-60'}`} style={{ backgroundColor: color }} />))}</div></div><button onClick={handleJoin} className="w-full py-3.5 bg-[#7A9D8C] text-white font-bold rounded-2xl shadow-sm text-sm">参加する</button></div>
        )}
      </div>
    </div>
  );
}

function UserSettingsModal({ currentUser, user: userProp, publicTrips = [], onToggleFollow, onOpenUserProfile, onUpgradeUser, onClose, onLogout }) {
  useLockBodyScroll(true);
  const user = currentUser || userProp || {};
  const [currentView, setCurrentView] = useState('menu');
  const [followListTab, setFollowListTab] = useState('following');
  const [name, setName] = useState(user?.isGuest ? '' : (user?.name || ''));
  const [bio, setBio] = useState(user?.bio || '');
  const [userId, setUserId] = useState(user?.isGuest ? '' : (user?.id || ''));
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(user?.password || (user?.isGuest ? '' : 'password123'));
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passkeys, setPasskeys] = useState(Array.isArray(user?.passkeys) ? user.passkeys : []);
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
  const [selectedPreset, setSelectedPreset] = useState(user?.avatar || FEMALE_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const isIdTaken = ['admin', 'test', 'user'].includes((userId || '').toLowerCase()) && userId !== user?.id;

  // ゲストからGoogle / Apple でワンタップ引き継ぎ登録するハンドラー
  const handleLinkOAuthFromGuest = (providerName) => {
    const newId = `${providerName.toLowerCase()}_${Math.floor(Math.random() * 9000 + 1000)}`;
    if (onUpgradeUser) {
      onUpgradeUser({
        ...user,
        id: newId,
        name: user?.name && user.name !== 'ゲストユーザー' ? user.name : `${providerName}トラベラー`,
        email: providerName === 'Google' ? 'user@gmail.com' : 'user@privaterelay.appleid.com',
        authProvider: providerName,
        isGuest: false
      });
    }
    customAlert(`${providerName}アカウントと連携し、これまでのしおりを引き継ぎました！`);
    setCurrentView('menu');
  };

  const handleSaveSecurity = () => {
    if (!email.trim()) { customAlert('メールアドレスを入力してください'); return; }

    let updatedPassword = password.trim();
    const isTryingToChangePw = Boolean(currentPasswordInput.trim() || newPassword.trim() || confirmNewPassword.trim());

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
        customAlert('パスワードを変更するには「現在のパスワード」を入力してください');
        return;
      }
      if (password && currentPasswordInput.trim() !== password) {
        customAlert('現在のパスワードが正しくありません。忘れた場合は「パスワードを忘れた方はこちら」から再設定してください。');
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
        isGuest: user?.isGuest ? false : user?.isGuest
      });
    }
    customAlert(isTryingToChangePw ? 'メールアドレスと新しいパスワードを保存しました！' : 'セキュリティ設定を保存しました！');
    setCurrentView('menu');
  };

  // パスキー（WebAuthn風）の新規登録ハンドラー
  const handleAddPasskey = async () => {
    if (isRegisteringPasskey) return;
    setIsRegisteringPasskey(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const deviceLabel = /iPhone|iPad|Macintosh/.test(ua)
        ? 'Apple iCloud キーチェーン (Face ID / Touch ID)'
        : /Android/.test(ua)
        ? 'Google パスワードマネージャー (生体認証)'
        : 'このデバイスのパスキー (Windows Hello / Touch ID)';

      const newPk = {
        id: 'pk_' + generateId(),
        name: `${deviceLabel}`,
        createdAt: new Date().toLocaleDateString('ja-JP')
      };
      const nextPasskeys = [...passkeys, newPk];
      setPasskeys(nextPasskeys);
      if (onUpgradeUser) {
        onUpgradeUser({ ...user, passkeys: nextPasskeys });
      }
      customAlert('新しいパスキーを登録しました！次回から生体認証等で素早くログインできます。');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleRemovePasskey = (pkId) => {
    const nextPasskeys = passkeys.filter(p => p.id !== pkId);
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
        isGuest: false
      });
    }
    customAlert('パスワードの再設定が完了しました！');
    setCurrentView('security');
  };

  // IDからユーザー情報（名前・アイコン・自己紹介）を解決するヘルパー
  const resolveUserById = (uid) => {
    const matchedTrip = (publicTrips || []).find(t => (t.authorId || t.members?.[0]?.id) === uid);
    if (matchedTrip) {
      return {
        id: uid,
        name: matchedTrip.authorName || uid,
        avatar: matchedTrip.authorAvatar || FEMALE_AVATARS[0],
        bio: matchedTrip.authorBio || `${matchedTrip.destination || '日本各地'}を旅しています！`
      };
    }
    const PRESET_PROFILES = {
      m1: { id: 'm1', name: 'アクティブ夫婦', avatar: FEMALE_AVATARS[0], bio: '週末は全国の絶景とアクティビティを求めて夫婦で旅しています！' },
      m2: { id: 'm2', name: 'たびたろう', avatar: MALE_AVATARS[1], bio: '温泉と美味しいお酒が大好き。関東近郊のんびり旅メインです♨️' },
      m3: { id: 'm3', name: 'くいしんぼう', avatar: FEMALE_AVATARS[2], bio: '食べるために旅をする！全国のローカルグルメ・カフェを開拓中🍰' },
      m4: { id: 'm4', name: '北陸さんぽ', avatar: FEMALE_AVATARS[3], bio: '北陸の美味しい海鮮と和菓子を探して旅しています🍣' },
      m5: { id: 'm5', name: 'ちゅら旅', avatar: MALE_AVATARS[2], bio: '離島と青い海が大好き！年に3回は沖縄に行きます🌺' }
    };
    return PRESET_PROFILES[uid] || { id: uid, name: uid, avatar: MALE_AVATARS[0], bio: 'たびたびユーザー' };
  };

  const followingIds = Array.isArray(user?.following) ? user.following : [];
  const followerIds = Array.isArray(user?.followers) ? user.followers : [];
  const myPublicPostCount = (publicTrips || []).filter(t => (t.authorId || t.members?.[0]?.id) === user?.id).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-6 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full pb-safe h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {currentView === 'menu' && (
          <div className="flex flex-col h-full animate-in fade-in">
            <div className="flex justify-between items-center mb-4 shrink-0"><h3 className="font-bold text-base text-stone-800">プロフィール・設定</h3><button onClick={onClose} className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              {user?.isGuest ? (
                 <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                   <div>
                     <h4 className="font-bold text-red-600 text-xs mb-1 flex items-center gap-1.5"><AlertCircle size={14}/> ゲストモード利用中（データ引き継ぎ可能）</h4>
                     <p className="text-[10px] text-red-500 leading-relaxed">Google・Apple・メールアドレスのいずれかで登録すると、今作っているしおりをそのまま引き継いで友達と共有できます。</p>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <button
                       type="button"
                       onClick={() => handleLinkOAuthFromGuest('Google')}
                       className="py-2.5 px-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                     >
                       <span className="text-xs font-extrabold text-blue-600">G</span> Googleで連携
                     </button>
                     <button
                       type="button"
                       onClick={() => handleLinkOAuthFromGuest('Apple')}
                       className="py-2.5 px-3 bg-stone-900 hover:bg-black text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                     >
                       <span></span> Appleで連携
                     </button>
                   </div>
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
                      <h3 className="font-extrabold text-lg text-stone-900 leading-tight">{user?.name}</h3>
                      <p className="text-xs text-stone-400 font-mono">@{user?.id}</p>
                    </div>

                    {/* 自己紹介文 */}
                    {user?.bio && (
                      <p className="text-xs text-stone-700 leading-relaxed mb-4 whitespace-pre-wrap">
                        {user.bio}
                      </p>
                    )}

                    {/* X / Instagram 風のフォロー・フォロワー・投稿数スタッツバー */}
                    {ENABLE_PUBLIC_SNS_FEATURES && (
                      <div className="flex items-center gap-6 pt-3 border-t border-stone-100">
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-sm text-stone-900">{myPublicPostCount}</span>
                          <span className="text-xs text-stone-500">公開しおり</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setFollowListTab('following'); setCurrentView('followList'); }}
                          className="flex items-baseline gap-1 group cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <span className="font-extrabold text-sm text-stone-900 group-hover:underline">{followingIds.length}</span>
                          <span className="text-xs text-stone-500">フォロー中</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFollowListTab('followers'); setCurrentView('followList'); }}
                          className="flex items-baseline gap-1 group cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <span className="font-extrabold text-sm text-stone-900 group-hover:underline">{followerIds.length}</span>
                          <span className="text-xs text-stone-500">フォロワー</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <button onClick={() => setCurrentView('account')} className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"><div className="flex items-center gap-3 text-stone-700 font-bold text-sm"><User size={18} className="text-[#7A9D8C]" /> {user?.isGuest ? 'アカウントを作成（プロフィール）' : 'プロフィール・居住地設定'}</div><ChevronRight size={18} className="text-stone-400" /></button>
                <button onClick={() => setCurrentView('security')} className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"><div className="flex items-center gap-3 text-stone-700 font-bold text-sm"><CheckCircle2 size={18} className="text-[#7A9D8C]" /> メールアドレス・パスワード設定</div><ChevronRight size={18} className="text-stone-400" /></button>
                <div className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                  <div className="pr-3">
                    <div className="flex items-center gap-2 text-stone-700 font-bold text-sm">
                      <Compass size={18} className="text-[#7A9D8C]" /> しおりの自動ミニ化
                    </div>
                    <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                      自分のしおりから戻る時に小さいアイコンとして画面に残す
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !(user?.autoMinimizeTrip !== false);
                      if (onUpgradeUser) onUpgradeUser({ ...user, autoMinimizeTrip: nextVal });
                      customAlert(nextVal ? 'しおりの自動ミニ化をONにしました' : 'しおりの自動ミニ化をOFFにしました');
                    }}
                    className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 flex items-center ${
                      user?.autoMinimizeTrip !== false ? 'bg-[#7A9D8C] justify-end' : 'bg-stone-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                <button onClick={() => setCurrentView('notifications')} className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"><div className="flex items-center gap-3 text-stone-700 font-bold text-sm"><Bell size={18} className="text-[#7A9D8C]" /> 通知設定</div><ChevronRight size={18} className="text-stone-400" /></button>
                <button onClick={() => setCurrentView('location')} className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"><div className="flex items-center gap-3 text-stone-700 font-bold text-sm"><MapPin size={18} className="text-[#7A9D8C]" /> 位置情報設定</div><ChevronRight size={18} className="text-stone-400" /></button>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 shrink-0 space-y-2">
              <button onClick={onLogout} className="w-full py-3.5 bg-red-50 text-red-500 font-bold rounded-2xl shadow-sm hover:bg-red-100 transition-colors flex justify-center items-center gap-2 text-sm"><LogOut size={16} /> ログアウト</button>
              {!user?.isGuest && (
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountConfirm(true)}
                  className="w-full py-2 text-[11px] font-bold text-stone-400 hover:text-red-500 transition-colors"
                >
                  アカウントを削除（退会）する
                </button>
              )}
            </div>
          </div>
        )}

        {currentView === 'followList' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <button onClick={() => setCurrentView('menu')} className="p-1.5 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full"><ChevronLeft size={22} /></button>
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 leading-tight">{user?.name}</h3>
                <p className="text-[11px] text-stone-400 font-mono">@{user?.id}</p>
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
              {(followListTab === 'following' ? followingIds : followerIds).length === 0 ? (
                <div className="py-16 text-center text-xs font-bold text-stone-400">
                  {followListTab === 'following' ? 'まだフォローしているユーザーはいません' : 'まだフォロワーはいません'}
                </div>
              ) : (
                (followListTab === 'following' ? followingIds : followerIds).map(uid => {
                  const targetProfile = resolveUserById(uid);
                  const isFollowingTarget = followingIds.includes(uid);
                  return (
                    <div key={uid} className="py-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenUserProfile && onOpenUserProfile(targetProfile)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                      >
                        <img src={targetProfile.avatar} alt={targetProfile.name} className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-800 truncate">{targetProfile.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono truncate">@{targetProfile.id}</p>
                        </div>
                      </button>
                      {onToggleFollow && (
                        <button
                          type="button"
                          onClick={() => onToggleFollow(uid, targetProfile.name)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all shrink-0 ${
                            isFollowingTarget
                              ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                              : 'bg-white text-stone-700 border-stone-300'
                          }`}
                        >
                          {isFollowingTarget ? 'フォロー中' : '+ フォロー'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* App Store / Google Play 審査必須のアカウント削除（退会）確認モーダル */}
        {showDeleteAccountConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[280] flex justify-center items-center p-4 animate-in fade-in" onClick={() => setShowDeleteAccountConfirm(false)}>
            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
                <Trash2 size={22} />
              </div>
              <h4 className="font-bold text-base text-stone-800 mb-2">アカウントを削除しますか？</h4>
              <p className="text-xs text-stone-500 leading-relaxed mb-5">
                アカウントを削除すると、プロフィール情報や作成したしおりデータがすべて消去され、元に戻すことはできません。
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountConfirm(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('tabitabi_user');
                    localStorage.removeItem('tabitabi_trips');
                    setShowDeleteAccountConfirm(false);
                    customAlert('アカウントを削除しました。ご利用ありがとうございました。');
                    onLogout();
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xs shadow-sm"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'account' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-5 shrink-0"><button onClick={() => setCurrentView('menu')} className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"><ChevronLeft size={22} /></button><h3 className="font-bold text-lg text-stone-800">{user?.isGuest ? 'アカウントを作成' : 'プロフィール・居住地設定'}</h3></div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-4">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-400">
                    {(customAvatar || selectedPreset) ? <img src={customAvatar || selectedPreset} alt="Avatar" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><Camera size={20} className="mb-0.5" /><span className="text-[10px] font-bold">変更する</span></div>}
                  </button>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#7A9D8C] text-white rounded-full flex items-center justify-center shadow-md pointer-events-none"><Camera size={13} /></div>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={async (e) => { if(e.target.files?.[0]) { const compressed = await compressImageFile(e.target.files[0], 500, 0.85); setCustomAvatar(compressed); } }} className="hidden" />
                </div>
                <div className="w-full space-y-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 text-center">イラストアイコンから選ぶ</p>
                  <div className="flex justify-center gap-2">{FEMALE_AVATARS.map(url => (<button key={url} type="button" onClick={() => { setSelectedPreset(url); setCustomAvatar(null); }} className={`w-9 h-9 rounded-full border-2 transition-all ${selectedPreset === url && !customAvatar ? 'border-[#7A9D8C] scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={url} alt="female" className="w-full h-full rounded-full object-cover" /></button>))}</div>
                  <div className="flex justify-center gap-2">{MALE_AVATARS.map(url => (<button key={url} type="button" onClick={() => { setSelectedPreset(url); setCustomAvatar(null); }} className={`w-9 h-9 rounded-full border-2 transition-all ${selectedPreset === url && !customAvatar ? 'border-[#7A9D8C] scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={url} alt="male" className="w-full h-full rounded-full object-cover" /></button>))}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-stone-500 mb-1 pl-1">ニックネーム</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]" /></div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">自己紹介文（プロフィールに表示）</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows="3" placeholder="好きな旅のスタイルや行きたい場所など..." className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none" />
                </div>
                <div><label className="block text-xs font-bold text-stone-500 mb-1 pl-1">ユーザーID</label><div className="relative"><input type="text" value={userId} onChange={e => setUserId(e.target.value)} className={`w-full p-3 pr-10 bg-stone-50 rounded-xl border ${userId && isIdTaken ? 'border-red-300 focus:ring-red-400' : 'border-stone-200 focus:ring-[#7A9D8C]'} text-sm font-bold focus:outline-none focus:ring-2 font-mono`} placeholder="半角英数字" />{userId && (<div className="absolute right-3 top-1/2 -translate-y-1/2">{isIdTaken ? <XCircle size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-[#7A9D8C]" />}</div>)}</div></div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">居住地・最寄り駅</label>
                  <div className="space-y-2">
                    <select value={residence} onChange={e => setResidence(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]">
                      <option value="未設定">都道府県を選択 (未設定)</option>{PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="市区町村 (例: 渋谷区)" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]" />
                    <StationSearchInput value={station} onChange={setStation} cityContext={city} prefectureContext={residence} />
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 shrink-0">
              <button
                onClick={() => {
                  if (!name.trim() || !userId.trim() || isIdTaken) {
                    customAlert('ニックネームと有効なIDを入力してください');
                    return;
                  }
                  if (onUpgradeUser) {
                    onUpgradeUser({
                      ...user,
                      id: userId.trim(),
                      name: name.trim(),
                      bio: bio.trim(),
                      residence,
                      city: city.trim(),
                      station: station.trim(),
                      avatar: customAvatar || selectedPreset,
                      isGuest: false
                    });
                  }
                  customAlert('プロフィールを保存しました！');
                  setCurrentView('menu');
                }}
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
              <button onClick={() => setCurrentView('menu')} className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"><ChevronLeft size={22} /></button>
              <h3 className="font-bold text-lg text-stone-800">メールアドレス・パスワード設定</h3>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1 space-y-5">
              <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-600 leading-relaxed">
                ログインやアカウント引き継ぎに使用するメールアドレス・パスワード、およびパスキー（生体認証）を管理できます。
              </div>

              {/* ① メールアドレス設定 */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
                <label className="block text-xs font-extrabold text-stone-700">登録メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                      <label className="text-[11px] font-bold text-stone-500">現在のパスワード（変更時必須）</label>
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
                      onChange={e => setCurrentPasswordInput(e.target.value)}
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
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="8文字以上の半角英数字"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1 pl-1">
                    {password ? '新しいパスワード（確認用）' : 'パスワード（確認用）'}
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
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
                      Face ID / Touch ID や画面ロックを使って、パスワード入力なしで安全・スピーディーにログインできます。
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    passkeys.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {passkeys.length > 0 ? `${passkeys.length}件登録中` : '未登録'}
                  </span>
                </div>

                {passkeys.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {passkeys.map(pk => (
                      <div key={pk.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-800 truncate">{pk.name}</p>
                          <p className="text-[10px] text-stone-400 font-bold">登録日: {pk.createdAt}</p>
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
                disabled={!email.trim() || (user?.isGuest && !password && !newPassword.trim())}
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
              <button onClick={() => setCurrentView('security')} className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"><ChevronLeft size={22} /></button>
              <h3 className="font-bold text-lg text-stone-800">パスワードを忘れた方（再設定）</h3>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1 space-y-4">
              {forgotStep === 1 ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold mb-1">📩 メール認証でパスワードをリセットします</p>
                    <p className="text-[11px] text-amber-800">
                      ご登録のメールアドレス宛に6桁の認証コードを送信します。現在のパスワードがわからなくても新しく設定し直すことができます。
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">送信先メールアドレス</label>
                    <input
                      type="email"
                      value={resetEmailInput}
                      onChange={e => setResetEmailInput(e.target.value)}
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
                      customAlert(`${resetEmailInput} 宛に認証コード（123456）を送信しました！`);
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
                    「{resetEmailInput}」に届いた6桁の認証コードと、新しく設定したいパスワードを入力してください。
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">認証コード（6桁）</label>
                    <input
                      type="text"
                      value={resetCodeInput}
                      onChange={e => setResetCodeInput(e.target.value)}
                      placeholder="例: 123456"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-base font-mono font-extrabold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">新しいパスワード</label>
                    <input
                      type="password"
                      value={resetNewPwInput}
                      onChange={e => setResetNewPwInput(e.target.value)}
                      placeholder="8文字以上の半角英数字"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 pl-1">新しいパスワード（確認用）</label>
                    <input
                      type="password"
                      value={resetConfirmPwInput}
                      onChange={e => setResetConfirmPwInput(e.target.value)}
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
            <div className="flex items-center gap-2 mb-6 shrink-0"><button onClick={() => setCurrentView('menu')} className="p-1 -ml-2 text-stone-400 hover:bg-stone-100 rounded-full"><ChevronLeft size={22} /></button><h3 className="font-bold text-lg text-stone-800">{currentView === 'notifications' ? '通知設定' : '位置情報設定'}</h3></div>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4"><Info size={40} className="text-stone-300 mb-4" /><h4 className="font-bold text-stone-600 mb-2">準備中です</h4><p className="text-xs text-stone-400 leading-relaxed">この機能は現在開発中です。</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// 他ユーザーのプロフィール画面モーダル
function PublicUserProfileModal({ userProfile, publicTrips, currentUser, onToggleFollow, onOpenTrip, onClose }) {
  useLockBodyScroll(true);
  const userPosts = publicTrips.filter(t => (t.authorId || t.members?.[0]?.id) === userProfile.id);
  const isMe = userProfile.id === currentUser.id;
  const isFollowing = Array.isArray(currentUser.following) && currentUser.following.includes(userProfile.id);
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-[220] flex justify-center items-end sm:items-center p-0 sm:p-6 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full pb-safe h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-base text-stone-800">ユーザープロフィール</h3>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <div className="bg-stone-50/90 p-5 rounded-3xl border border-stone-100 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img src={userProfile.avatar || FEMALE_AVATARS[0]} alt={userProfile.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-white shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-lg text-stone-800 truncate">{userProfile.name}</h4>
                  <p className="text-xs text-stone-400 font-mono">@{userProfile.id}</p>
                </div>
              </div>
              {!isMe && (
                <button
                  type="button"
                  onClick={() => onToggleFollow(userProfile.id, userProfile.name)}
                  style={
                    isFollowing
                      ? { backgroundColor: '#7A9D8C', color: '#ffffff', borderColor: '#7A9D8C' }
                      : { backgroundColor: '#ffffff', color: '#44403c', borderColor: '#d6d3d1' }
                  }
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all shadow-2xs flex items-center gap-1"
                >
                  {isFollowing ? <><Check size={13} strokeWidth={3} /> フォロー中</> : '+ フォロー'}
                </button>
              )}
            </div>

            {userProfile.bio && (
              <p className="text-xs text-stone-600 leading-relaxed mb-4 bg-white p-3 rounded-2xl border border-stone-100">{userProfile.bio}</p>
            )}

            <div className="flex justify-around bg-white py-2.5 rounded-2xl border border-stone-100 text-center">
              <div>
                <p className="text-sm font-extrabold text-stone-800">{userPosts.length}</p>
                <p className="text-[10px] font-bold text-stone-400">公開しおり</p>
              </div>
              <div className="border-x border-stone-100 px-6">
                <p className="text-sm font-extrabold text-stone-800">{totalLikes}</p>
                <p className="text-[10px] font-bold text-stone-400">累計いいね</p>
              </div>
              <div>
                <p className="text-sm font-extrabold text-stone-800">{(isFollowing ? 1 : 0) + 24}</p>
                <p className="text-[10px] font-bold text-stone-400">フォロワー</p>
              </div>
            </div>
          </div>

          <h4 className="text-xs font-bold text-stone-500 mb-3 pl-1 flex items-center gap-1.5">
            <Globe size={14} className="text-[#7A9D8C]" /> 公開中のしおり ({userPosts.length})
          </h4>
          {userPosts.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400 font-bold bg-stone-50 rounded-2xl">まだ公開されているしおりがありません</div>
          ) : (
            <div className="space-y-3">
              {userPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => onOpenTrip(post.id)}
                  className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs hover:border-[#7A9D8C] transition-all cursor-pointer flex gap-3 items-center"
                >
                  {post.covers?.[0] ? (
                    <img src={post.covers[0]} alt={post.title} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-400"><MapIcon size={20} /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-stone-800 truncate mb-1">{post.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold mb-1">
                      <span className="flex items-center gap-0.5"><MapPin size={10} className="text-[#7A9D8C]" />{post.destination}</span>
                      <span className="flex items-center gap-0.5"><Heart size={10} className="text-red-400" />{post.likes}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#7A9D8C]">しおりを開く →</span>
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

function DiscoverTab({ publicTrips, setPublicTrips, currentUser, dashboardState, setDashboardState, onOpenTrip, onCopyTrip, onToggleLike, onToggleFollow, onOpenUserProfile, onEnlargeImage, onRefreshPublicTrips, onAddComment, scrollContainerRef, hideChrome, onFeedScroll, isFilterOpen, setIsFilterOpen }) {
  const searchQuery = dashboardState?.searchQuery || '';
  const discoverSort = dashboardState?.discoverSort || 'trending';
  const selectedRegion = dashboardState?.selectedRegion || 'すべて';

  const setSearchQuery = (val) => setDashboardState(prev => ({ ...prev, searchQuery: val }));
  const setDiscoverSort = (val) => setDashboardState(prev => ({ ...prev, discoverSort: val }));
  const setSelectedRegion = (val) => setDashboardState(prev => ({ ...prev, selectedRegion: val }));

  const [searchInput, setSearchInput] = useState(searchQuery);
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput.trim());
    if (setIsFilterOpen) setIsFilterOpen(false);
  };

  const [reportingTrip, setReportingTrip] = useState(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const isFilterActive = selectedRegion !== 'すべて' || searchQuery.trim() !== '';

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
    const scrollTop = scrollContainerRef?.current ? scrollContainerRef.current.scrollTop : 0;
    if (scrollTop <= 0 && !isRefreshing) {
      pullStartYRef.current = e.touches[0].clientY;
    } else {
      pullStartYRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (pullStartYRef.current === null || isRefreshing) return;
    const scrollTop = scrollContainerRef?.current ? scrollContainerRef.current.scrollTop : 0;
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
    const scrollTop = scrollContainerRef?.current ? scrollContainerRef.current.scrollTop : 0;
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
      result = result.filter(t => {
        const authorId = t.authorId || t.members?.[0]?.id;
        return followingIds.includes(authorId);
      });
    } else if (discoverSort === 'favorites') {
      result = result.filter(t => Array.isArray(t.likedBy) && t.likedBy.includes(currentUser.id));
    }

    if (selectedRegion !== 'すべて') {
      result = result.filter(t => t.region === selectedRegion);
    }

    if (searchQuery.trim()) { 
      const q = searchQuery.toLowerCase(); 
      result = result.filter(t => (t.title || '').toLowerCase().includes(q) || (t.destination || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || (t.authorName || '').toLowerCase().includes(q)); 
    }

    if (discoverSort === 'trending') {
      const now = Date.now();
      result.sort((a, b) => {
        const daysA = Math.max(0.5, (now - (a.publishedAt || now)) / (1000 * 60 * 60 * 24));
        const scoreA = (((a.likes || 0) * 5) + (a.views || 0)) / daysA;
        const daysB = Math.max(0.5, (now - (b.publishedAt || now)) / (1000 * 60 * 60 * 24));
        const scoreB = (((b.likes || 0) * 5) + (b.views || 0)) / daysB;
        return scoreB - scoreA;
      });
    } else {
      result.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
    }

    return result.map(data => ({ type: 'trip', data }));
  }, [publicTrips, searchQuery, discoverSort, selectedRegion, currentUser.following, currentUser.id]);

  const favoriteCount = useMemo(
    () => (publicTrips || []).filter(t => Array.isArray(t.likedBy) && t.likedBy.includes(currentUser.id)).length,
    [publicTrips, currentUser.id]
  );

  const tabsList = ENABLE_PUBLIC_SNS_FEATURES
    ? [
        { id: 'trending', label: 'おすすめ' },
        { id: 'new', label: '新着' },
        { id: 'following', label: 'フォロー中' },
        { id: 'favorites', label: `お気に入り${favoriteCount > 0 ? ` (${favoriteCount})` : ''}` }
      ]
    : [
        { id: 'trending', label: '人気プラン' },
        { id: 'new', label: '新着' },
        { id: 'favorites', label: `お気に入り${favoriteCount > 0 ? ` (${favoriteCount})` : ''}` }
      ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* ① X（旧Twitter）風のスリムなフラット・アンダーラインタブバー ＋ エリア選択タブ（下スクロール時に連動して隠れ、上スクロールで即復帰） */}
      <div
        className={`bg-white/95 backdrop-blur-md border-b border-stone-200/80 shrink-0 z-20 transition-all duration-300 overflow-hidden ${
          hideChrome && !isFilterOpen
            ? 'max-h-0 opacity-0 -translate-y-full border-none pointer-events-none'
            : 'max-h-64 opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center px-2 border-b border-stone-100">
          {tabsList.map(tab => {
            const isActive = discoverSort === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDiscoverSort(tab.id)}
                className={`flex-1 py-2.5 text-xs font-extrabold relative transition-colors text-center ${
                  isActive ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#7A9D8C] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 常時すぐ切り替えられるエリア選択タブ（横スクロールピル） */}
        <div
          data-no-swipe="true"
          className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-stone-50/60"
        >
          {['すべて', ...REGIONS].map(r => {
            const isSelected = selectedRegion === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRegion(r)}
                className={`whitespace-nowrap px-3 py-1 text-[11px] font-bold rounded-full border transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-[#7A9D8C] text-white border-[#7A9D8C] shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-200/90 hover:bg-stone-100'
                }`}
              >
                {r === 'すべて' ? '🗾 全国すべて' : r}
              </button>
            );
          })}
        </div>

        {/* キーワード検索が有効なときのコンパクトなステータスバー */}
        {!isFilterOpen && searchQuery.trim() !== '' && (
          <div className="px-4 py-1.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <span className="text-stone-400 font-bold shrink-0">検索ワード:</span>
              <span className="px-2 py-0.5 bg-white border border-stone-200 text-stone-700 rounded-full font-bold truncate">
                「{searchQuery}」
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchQuery('');
              }}
              className="text-stone-400 hover:text-stone-600 font-bold underline shrink-0"
            >
              クリア
            </button>
          </div>
        )}

        {/* 右上の「検索」ボタンを押したときだけ展開するキーワード検索ドロワー */}
        {isFilterOpen && (
          <div className="px-4 py-2.5 bg-stone-50/90 border-t border-stone-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={handleExecuteSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="行き先・スポット名・キーワードを入力"
                  className="w-full py-1.5 pl-8 pr-7 bg-white rounded-xl text-xs font-bold border border-stone-200 focus:border-[#7A9D8C] focus:outline-none transition-all"
                />
                {(searchInput || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    title="クリア"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="shrink-0 px-3.5 py-1.5 bg-[#7A9D8C] hover:bg-[#688a79] text-white font-bold rounded-xl text-xs shadow-2xs transition-all active:scale-95"
              >
                検索
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ② 投稿タイムライン領域（Xのようにスッキリ見やすいストリーム型フィード） */}
      <div
        ref={scrollContainerRef}
        onScroll={onFeedScroll}
        className="flex-1 overflow-y-auto overscroll-y-contain no-scrollbar pb-24 bg-white"
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
          className="overflow-hidden flex items-center justify-center transition-all duration-200 bg-stone-50 border-b border-stone-100"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="flex items-center gap-2 bg-white px-3.5 py-1 rounded-full shadow-2xs border border-stone-200/80 text-[11px] font-bold text-stone-600">
            {isRefreshing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#7A9D8C]/30 border-t-[#7A9D8C] rounded-full animate-spin" />
                <span className="text-[#7A9D8C]">新しい旅を読み込み中...</span>
              </>
            ) : (
              <>
                <span
                  className="inline-block transition-transform duration-200 text-[#7A9D8C] font-extrabold"
                  style={{ transform: pullDistance >= PULL_THRESHOLD ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ↓
                </span>
                <span>{pullDistance >= PULL_THRESHOLD ? '離して更新する' : '下に引っ張って更新'}</span>
              </>
            )}
          </div>
        </div>

        {/* ★ フェーズ1用：一般ユーザー向けの1行スリム案内バー（「配信管理」ボタンを削除し、誰が見てもクリーンな表示に統一） */}
        {!ENABLE_PUBLIC_SNS_FEATURES && SHOW_SNS_COMING_SOON_BANNER && !dismissedBanner && (
          <div className="bg-[#7A9D8C]/10 border-b border-[#7A9D8C]/20 px-4 py-2 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="shrink-0 text-[9px] font-extrabold bg-[#7A9D8C] text-white px-2 py-0.5 rounded-full">
                公式厳選
              </span>
              <span className="font-bold text-stone-700 truncate">
                実録モデルコース配信中（🚧 SNS投稿機能は近日搭載）
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDismissedBanner(true)}
              className="text-stone-400 hover:text-stone-600 p-0.5 shrink-0"
              title="バナーを閉じる"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="divide-y divide-stone-200/80">
          {feedItems.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-xs font-bold flex flex-col items-center gap-2">
              {discoverSort === 'favorites' ? (
                <>
                  <Heart size={28} className="opacity-40 text-red-400" />
                  <span>お気に入り（いいね）した旅がまだありません</span>
                  <span className="text-[11px] text-stone-400 font-normal">気になる投稿のハートボタンを押すとここに保存されます</span>
                </>
              ) : (
                <>
                  <Compass size={28} className="opacity-40" />
                  <span>{discoverSort === 'following' ? 'フォロー中のユーザーの投稿がまだありません' : '該当する旅行が見つかりませんでした'}</span>
                </>
              )}
            </div>
          ) : (
            feedItems.map((item, idx) => {
              const trip = item.data;
              const hasLiked = Array.isArray(trip.likedBy) && trip.likedBy.includes(currentUser.id);
              const authorId = trip.authorId || trip.members?.[0]?.id || `author_${trip.authorName}`;
              const isMe = authorId === currentUser.id;
              const isFollowing = Array.isArray(currentUser.following) && currentUser.following.includes(authorId);
              const isOfficialMode = !ENABLE_PUBLIC_SNS_FEATURES;
              const eventSum = (trip.events || []).reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
              const displayCost = eventSum > 0 ? eventSum : (trip.budget || 0);

              return (
                <article
                  key={trip.id || idx}
                  onClick={() => onOpenTrip(trip.id, true)}
                  className="bg-white hover:bg-stone-50/60 transition-colors cursor-pointer pt-3.5 pb-3"
                >
                  {/* 上部：Xのタイムライン風の投稿者ヘッダー */}
                  <div className="px-4 flex items-center justify-between gap-2 mb-2">
                    {isOfficialMode ? (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <OfficialBrandAvatar size="w-9 h-9" iconSize={16} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs font-extrabold text-stone-900 truncate">
                              {OFFICIAL_ACCOUNT_PROFILE.name}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {OFFICIAL_ACCOUNT_PROFILE.handle}
                            </span>
                            <span className="text-[10px] text-stone-300">·</span>
                            <span className="text-[10px] text-stone-400 font-bold">
                              {trip.startDate?.replace(/-/g, '/')}取材
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-extrabold text-[#557465] bg-[#7A9D8C]/12 px-2 py-0.2 rounded-full">
                              🗾 {trip.destination}
                            </span>
                            <span className="text-[10px] font-bold text-stone-400">
                              全{(trip.events || []).length}スポット収録
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUserProfile && onOpenUserProfile({
                            id: authorId,
                            name: trip.authorName,
                            avatar: trip.authorAvatar || FEMALE_AVATARS[0],
                            bio: trip.authorBio || `${trip.destination}などを旅しています！`
                          });
                        }}
                        className="flex items-center gap-2.5 text-left group min-w-0 cursor-pointer"
                      >
                        <img src={trip.authorAvatar || FEMALE_AVATARS[0]} className="w-9 h-9 rounded-full border border-stone-100 bg-stone-50 group-hover:ring-2 group-hover:ring-[#7A9D8C] transition-all shrink-0" alt="author" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-extrabold text-stone-900 group-hover:text-[#7A9D8C] transition-colors truncate">{trip.authorName}</p>
                            <span className="text-[10px] text-stone-400">· {new Date(trip.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[10px] text-[#557465] font-bold">{trip.destination}</p>
                        </div>
                      </button>
                    )}

                    {ENABLE_PUBLIC_SNS_FEATURES && (
                      <div className="flex items-center gap-1 shrink-0">
                        {!isMe && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFollow && onToggleFollow(authorId, trip.authorName);
                            }}
                            style={
                              isFollowing
                                ? { backgroundColor: '#7A9D8C', color: '#ffffff', borderColor: '#7A9D8C' }
                                : { backgroundColor: '#ffffff', color: '#44403c', borderColor: '#d6d3d1' }
                            }
                            className="px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                          >
                            {isFollowing ? <><Check size={11} strokeWidth={3} /> フォロー中</> : '+ フォロー'}
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
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 本文エリア：タイトル＆説明文＆主な立ち寄り先プレビュー */}
                  <div className="px-4 mb-2.5">
                    <h3 className="font-extrabold text-[15px] text-stone-900 leading-snug mb-1">
                      {trip.title}
                    </h3>
                    {trip.description && (
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-2">
                        {trip.description}
                      </p>
                    )}

                    {/* Xのタイムライン上でどんな行程かわかるコンパクトなルートチップ */}
                    {Array.isArray(trip.events) && trip.events.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] font-bold text-stone-500">
                        {trip.events.slice(0, 3).map((ev, eIdx) => (
                          <React.Fragment key={ev.id || eIdx}>
                            <span className="whitespace-nowrap bg-stone-100/90 text-stone-700 px-2 py-0.5 rounded-md truncate max-w-[135px]">
                              {ev.time} {ev.location || ev.title}
                            </span>
                            {eIdx < Math.min(2, trip.events.length - 1) && (
                              <span className="text-stone-300 shrink-0">→</span>
                            )}
                          </React.Fragment>
                        ))}
                        {trip.events.length > 3 && (
                          <span className="whitespace-nowrap text-[10px] text-[#7A9D8C] font-extrabold pl-1 shrink-0">
                            +{trip.events.length - 3}件
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* カバー写真カルーセル */}
                  {trip.covers && trip.covers.length > 0 && (
                    <CoverPhotoCarousel
                      covers={trip.covers}
                      onEnlargeImage={onEnlargeImage}
                      onOpenTrip={() => onOpenTrip(trip.id, true)}
                    />
                  )}

                  {/* 下部アクションバー（いいね・コメント・予算・コピー） */}
                  <div className="px-4 pt-1 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(trip.id);
                        }}
                        className="flex items-center gap-1.5 text-stone-500 hover:text-red-500 transition-colors"
                      >
                        <Heart size={17} className={hasLiked ? 'fill-red-500 text-red-500' : ''} />
                        <span className="text-xs font-bold">{trip.likes}</span>
                      </button>

                      {ENABLE_PUBLIC_SNS_FEATURES && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTrip(trip.id, true);
                          }}
                          className="flex items-center gap-1.5 text-stone-500 hover:text-[#7A9D8C] transition-colors"
                        >
                          <MessageCircle size={17} />
                          <span className="text-xs font-bold">{(trip.comments || []).length}</span>
                        </button>
                      )}

                      {displayCost > 0 && (
                        <span className="text-[11px] font-bold text-stone-500 flex items-center gap-0.5">
                          <Banknote size={13} className="text-[#7A9D8C]" />
                          ¥{displayCost.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onCopyTrip && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyTrip(trip);
                          }}
                          className="px-3 py-1.5 bg-[#7A9D8C]/15 text-[#557465] hover:bg-[#7A9D8C]/25 text-[11px] font-extrabold rounded-full transition-colors flex items-center gap-1 active:scale-95"
                        >
                          <Copy size={12} /> コピーして使う
                        </button>
                      )}
                    </div>
                  </div>
                </article>
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
            customAlert(`「${reason}」として報告を受け付けました。ご協力ありがとうございます。`);
          }}
        />
      )}
    </div>
  );
}

// みんなの旅カード用の正方形1.5枚見え（ピーキング）横スワイプカルーセル
function CoverPhotoCarousel({ covers, onEnlargeImage, onOpenTrip }) {
  if (!Array.isArray(covers) || covers.length === 0) return null;

  // 1枚だけのときも正方形（aspect-square）で見やすく表示
  if (covers.length === 1) {
    return (
      <div
        className="px-4 pb-2.5 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (onOpenTrip) onOpenTrip();
        }}
      >
        <div
          className="w-[74%] aspect-square rounded-2xl bg-stone-100 cursor-pointer relative group overflow-hidden shadow-xs border border-stone-200/60"
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
          <span className="absolute bottom-2.5 right-2.5 bg-black/55 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-2xs">
            1/1
          </span>
        </div>
      </div>
    );
  }

  // 2枚以上のときは1枚目が約68%幅の正方形、右側に2枚目が半分（合計約1.5枚分）チラ見えして横にスワイプできるカルーセル
  return (
    <div
      data-carousel-area="true"
      data-no-swipe="true"
      className="pb-2.5 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 snap-x snap-mandatory"
      >
        {covers.map((cover, cIdx) => (
          <div
            key={cIdx}
            onClick={(e) => {
              e.stopPropagation();
              onEnlargeImage(cover);
            }}
            className="w-[66%] shrink-0 aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/70 shadow-xs relative snap-start cursor-pointer group"
          >
            <img
              src={cover}
              draggable={false}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
              alt={`cover ${cIdx + 1}`}
            />
            <span className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-2xs pointer-events-none">
              {cIdx + 1}/{covers.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 投稿の報告モーダル
function ReportModal({ trip, onClose, onSubmit }) {
  useLockBodyScroll(true);
  const REPORT_REASONS = [
    'スパム・宣伝目的の投稿',
    '不適切なコンテンツ・公序良俗に反する内容',
    '虚偽の情報・誤解を招く内容',
    '著作権・プライバシーの侵害',
    'その他'
  ];
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 z-[260] flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 pb-safe max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-base text-stone-800 flex items-center gap-2">
            <Flag size={18} className="text-red-500" /> 投稿を報告する
          </h3>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 mb-4">
            <p className="text-[10px] font-bold text-stone-400 mb-0.5">対象の投稿</p>
            <p className="text-xs font-bold text-stone-700 truncate">{trip.title}（{trip.authorName}）</p>
          </div>

          <label className="block text-xs font-bold text-stone-500 mb-2 pl-1">報告する理由を選択してください</label>
          <div className="space-y-2 mb-4">
            {REPORT_REASONS.map(reason => (
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
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedReason === reason ? 'border-red-500' : 'border-stone-300'}`}>
                  {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1.5 pl-1">詳細（任意）</label>
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
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
function TripDetail({ currentUser, trip, isReadOnly, myTrips, updateTrip, onDeleteTrip, onToggleAutoMinimize, onPublish, onBack, onEnlargeImage, onCopySave, onOpenAuthUpgrade, onAddComment }) {
  const generateDateArray = (start, end) => {
    const arr = [];
    let dt = new Date(start);
    const endDt = new Date(end);
    while (dt <= endDt) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr.length > 0 ? arr : [start || getTodayString()];
  };
  const tripDates = generateDateArray(trip.startDate, trip.endDate);

  // 今日の日付が旅行日程に含まれている場合のみ今日を選択し、それ以外は1日目を選択するヘルパー
  const getInitialTripDate = (datesList) => {
    if (!Array.isArray(datesList) || datesList.length === 0) return trip.startDate || getTodayString();
    const todayStr = getTodayString();
    return datesList.includes(todayStr) ? todayStr : datesList[0];
  };

  const [activeTab, setActiveTab] = useState('shiori'); 
  const [selectedDate, setSelectedDate] = useState(() => getInitialTripDate(tripDates));
  const [shioriSubTab, setShioriSubTab] = useState('date'); // 'date' | 'packing' | 'budget'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [copyTarget, setCopyTarget] = useState(null); 
  const [showAiChatModal, setShowAiChatModal] = useState(false);

  // スクロール時やタップで上下のバーを隠してタイムラインを広く見せるステート
  const [hideBars, setHideBars] = useState(false);
  const lastScrollTopRef = useRef(0);
  const lastBarToggleRef = useRef(0);

  const isAnyTripModalOpen = Boolean(
    isSettingsOpen || showPublishModal || showDeleteConfirmModal || copyTarget || showAiChatModal
  );

  const handleMainScroll = (e) => {
    if (isAnyTripModalOpen) return;
    const el = e.currentTarget;
    const st = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const diff = st - lastScrollTopRef.current;
    const now = Date.now();

    if (st <= 24) {
      if (hideBars) {
        setHideBars(false);
        lastBarToggleRef.current = now;
      }
      lastScrollTopRef.current = st;
      return;
    }

    if (maxScroll - st <= 40 || now - lastBarToggleRef.current < 260) {
      lastScrollTopRef.current = st;
      return;
    }

    if (st > 68 && diff > 16 && !hideBars) {
      setHideBars(true);
      lastBarToggleRef.current = now;
    } else if (diff < -14 && hideBars) {
      setHideBars(false);
      lastBarToggleRef.current = now;
    }
    lastScrollTopRef.current = st;
  };

  // スワイプで戻るジェスチャー用のステート・Ref（タッチ＆マウスドラッグ両対応）
  const swipeStartRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleSwipeStart = (clientX, clientY, target) => {
    if (target && target.closest('input, textarea, select, [data-no-swipe]')) return;
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
  const [editDestination, setEditDestination] = useState(trip.destination || '');
  const [editStartDate, setEditStartDate] = useState(trip.startDate || getTodayString());
  const [editEndDate, setEditEndDate] = useState(trip.endDate || trip.startDate || getTodayString());

  useEffect(() => {
    setEditTitle(trip.title || '');
    setEditDestination(trip.destination || '');
    setEditStartDate(trip.startDate || getTodayString());
    setEditEndDate(trip.endDate || trip.startDate || getTodayString());
  }, [trip.id, trip.title, trip.destination, trip.startDate, trip.endDate]);

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

    const updatedEvents = (trip.events || []).map(ev => {
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
      events: updatedEvents
    });
    setSelectedDate(editStartDate);
    setEditEndDate(validEnd);
    customAlert('旅の基本情報（名前・行き先・日程）を更新しました！');
  };

  // しおりを開いた際、今日の日付が旅行日程にある場合のみ今日を選択し、日付タブも見える位置へスクロールする
  const dateTabsContainerRef = useRef(null);
  useEffect(() => {
    const targetDate = getInitialTripDate(generateDateArray(trip.startDate, trip.endDate));
    setSelectedDate(targetDate);
    setActiveTab('shiori');
    setShioriSubTab('date');
    setIsSettingsOpen(false);
    setHideBars(false);

    setTimeout(() => {
      const activeTabEl = dateTabsContainerRef.current?.querySelector(`[data-date-tab="${targetDate}"]`);
      if (activeTabEl) {
        activeTabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 120);
  }, [trip.id]);

  // 持ち物カウント（各自の持ち物はログイン中のユーザー自身の分＋みんなの共用分のみを集計）
  const rawPackingItems = Array.isArray(trip.packingList) ? trip.packingList : [];
  const myVisiblePackingItems = rawPackingItems.filter(item =>
    item.category === 'shared' || !item.ownerId || item.ownerId === currentUser?.id
  );
  const isPackingItemCheckedByMe = (item) => {
    if (item.category === 'shared') return Boolean(item.checked);
    if (item.checkedBy && typeof item.checkedBy === 'object') {
      return Boolean(item.checkedBy[currentUser?.id]);
    }
    return Boolean(item.checked);
  };
  const checkedPackingCount = myVisiblePackingItems.filter(isPackingItemCheckedByMe).length;

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F7F5] animate-in slide-in-from-right-8 duration-300 relative"
      style={swipeOffset > 0 ? { transform: `translateX(${swipeOffset}px)`, transition: 'none' } : { transition: 'transform 0.2s ease-out' }}
      onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY, e.target)}
      onTouchMove={(e) => handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
      onMouseDown={(e) => handleSwipeStart(e.clientX, e.clientY, e.target)}
      onMouseMove={(e) => { if (e.buttons === 1) handleSwipeMove(e.clientX, e.clientY); }}
      onMouseUp={(e) => handleSwipeEnd(e.clientX, e.clientY)}
    >
      {/* 上下バーが隠れているときに左上に浮かぶミニ操作ピル（戻る＆バー再表示） */}
      {hideBars && (
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none animate-in fade-in duration-200">
          <button
            type="button"
            onClick={onBack}
            className="pointer-events-auto px-3 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-200/80 text-stone-700 text-xs font-bold flex items-center gap-1 active:scale-95"
          >
            <ChevronLeft size={16} /> 戻る
          </button>
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowAiChatModal(true)}
              className="px-3.5 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300/80 shadow-md text-[11px] font-extrabold flex items-center gap-1 active:scale-95"
            >
              <Sparkles size={13} className="text-sky-500" /> AI相談
            </button>
            <button
              type="button"
              onClick={() => setHideBars(false)}
              className="px-3.5 py-2 rounded-full bg-stone-800/85 backdrop-blur-md shadow-md text-white text-[11px] font-bold flex items-center gap-1.5 active:scale-95"
            >
              <span>📅 メニュー表示</span>
            </button>
          </div>
        </div>
      )}

      {/* ① 上部エリア（スクロール時に自動でスッキリ収納可能） */}
      <div
        className={`bg-white px-5 shadow-sm z-20 shrink-0 border-b border-stone-100 relative transition-all duration-300 overflow-hidden ${
          hideBars ? 'max-h-0 pt-0 pb-0 opacity-0 border-none' : 'max-h-48 pt-10 pb-3 opacity-100'
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className="p-1.5 -ml-1.5 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h2 className="font-bold text-base text-stone-800 truncate flex-1 text-center px-2">{trip.title}</h2>
          <div className="flex items-center gap-1">
            {/* タイトルを邪魔しない可愛い薄い水色のミニAI相談ボタン */}
            <button
              type="button"
              onClick={() => setShowAiChatModal(true)}
              className="px-2.5 py-1 bg-sky-100/90 hover:bg-sky-200/80 text-sky-800 border border-sky-300/70 rounded-full text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition-all"
              title="AIコンシェルジュに文章で相談する"
            >
              <Sparkles size={11} className="text-sky-500" /> AI相談
            </button>
            {isReadOnly ? (
              <button
                onClick={() => setCopyTarget({ type: 'trip', data: trip })}
                className="px-3 py-1.5 bg-[#7A9D8C] text-white hover:bg-[#688a79] rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs active:scale-95"
                title="このしおりをコピーして使う"
              >
                <Copy size={13} /> コピー
              </button>
            ) : (
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
            )}
          </div>
        </div>
        
        {activeTab === 'shiori' && (
          <div className="flex items-end justify-between gap-2 pb-0.5">
            {/* 左側：日程（日付）タブ（日数が多い場合はここだけ横スクロール） */}
            <div
              ref={dateTabsContainerRef}
              data-no-swipe="true"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="flex items-end gap-1.5 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden"
            >
              {tripDates.map((date, idx) => {
                const isSelected = shioriSubTab === 'date' && date === selectedDate;
                const dateObj = new Date(date);
                const isToday = date === getTodayString();
                return (
                  <button
                    key={date}
                    data-date-tab={date}
                    onClick={() => {
                      setShioriSubTab('date');
                      setSelectedDate(date);
                    }}
                    className={`py-1.5 px-2.5 whitespace-nowrap border-b-2 flex flex-col items-center min-w-[54px] rounded-t-xl transition-all ${
                      isSelected ? 'border-[#7A9D8C] bg-[#7A9D8C]/10' : 'border-transparent text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`text-[9px] font-extrabold leading-none ${isSelected ? 'text-[#557465]' : 'text-stone-400'}`}>
                        {idx + 1}日目
                      </span>
                      {isToday && (
                        <span className={`text-[8px] px-1 py-0.2 rounded-full font-bold leading-none ${isSelected ? 'bg-[#7A9D8C] text-white' : 'bg-red-50 text-red-500'}`}>
                          今日
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#7A9D8C]' : 'text-stone-600'}`}>{`${dateObj.getMonth() + 1}/${dateObj.getDate()}`}</span>
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
                  <CheckCircle2 size={13} className={shioriSubTab === 'packing' ? 'text-[#7A9D8C]' : 'text-stone-400'} />
                  <span className="text-xs font-bold">持ち物</span>
                  {myVisiblePackingItems.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      shioriSubTab === 'packing' ? 'bg-[#7A9D8C] text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
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
                <Banknote size={14} className={shioriSubTab === 'budget' ? 'text-[#7A9D8C]' : 'text-stone-400'} />
                <span className="text-xs font-bold">予算</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ② 中央スクロールエリア（下にスクロールすると上下バーが自動で隠れて全画面で広く見られる） */}
      <main
        onScroll={handleMainScroll}
        className="flex-1 overflow-y-auto overscroll-y-contain z-10 relative scroll-smooth no-scrollbar"
      >
        {activeTab === 'shiori' ? (
          shioriSubTab === 'packing' && !isReadOnly ? (
            <PackingListView trip={trip} updateTrip={updateTrip} currentUser={currentUser} isReadOnly={isReadOnly} />
          ) : shioriSubTab === 'budget' ? (
            <BudgetView trip={trip} updateTrip={updateTrip} currentUser={currentUser} isReadOnly={isReadOnly} />
          ) : (
            <Timeline trip={trip} updateTrip={updateTrip} selectedDate={selectedDate} currentUser={currentUser} isReadOnly={isReadOnly} onCopyEvent={(e) => setCopyTarget({ type: 'event', data: e })} onCopyDay={(dayEvents) => setCopyTarget({ type: 'day', data: dayEvents })} onEnlargeImage={onEnlargeImage} onOpenAiChat={() => setShowAiChatModal(true)} />
          )
        ) : activeTab === 'comments' ? (
          <CommentView trip={trip} currentUser={currentUser} onAddComment={onAddComment} />
        ) : (
          <AlbumView trip={trip} currentUser={currentUser} updateTrip={updateTrip} isReadOnly={isReadOnly} onEnlargeImage={onEnlargeImage} />
        )}
      </main>

      {/* ③ 下部バー（閲覧専用かつコメント非表示のときは自動で隠し、スクロール時も隠れる） */}
      {!(isReadOnly && !ENABLE_PUBLIC_SNS_FEATURES) && (
        <nav
          className={`bg-white/95 backdrop-blur-md border-t border-stone-200/60 flex justify-around pb-safe z-30 relative shrink-0 transition-all duration-300 overflow-hidden ${
            hideBars ? 'max-h-0 py-0 opacity-0 border-none' : 'max-h-20 opacity-100'
          }`}
        >
          <button onClick={() => setActiveTab('shiori')} className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-1 transition-colors ${activeTab === 'shiori' ? 'text-[#7A9D8C]' : 'text-stone-400'}`}><div className={`p-1 rounded-xl ${activeTab === 'shiori' ? 'bg-[#7A9D8C]/10' : ''}`}><MapIcon size={20} strokeWidth={activeTab === 'shiori' ? 2.5 : 2} /></div><span className="text-[10px] font-bold">しおり</span></button>
          {!isReadOnly && <button onClick={() => setActiveTab('album')} className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-1 transition-colors ${activeTab === 'album' ? 'text-[#7A9D8C]' : 'text-stone-400'}`}><div className={`p-1 rounded-xl ${activeTab === 'album' ? 'bg-[#7A9D8C]/10' : ''}`}><ImageIcon size={20} strokeWidth={activeTab === 'album' ? 2.5 : 2} /></div><span className="text-[10px] font-bold">思い出写真</span></button>}
          {isReadOnly && ENABLE_PUBLIC_SNS_FEATURES && <button onClick={() => setActiveTab('comments')} className={`flex-1 py-2.5 flex flex-col justify-center items-center gap-1 transition-colors ${activeTab === 'comments' ? 'text-[#7A9D8C]' : 'text-stone-400'}`}><div className={`p-1 rounded-xl ${activeTab === 'comments' ? 'bg-[#7A9D8C]/10' : ''}`}><MessageSquare size={20} strokeWidth={activeTab === 'comments' ? 2.5 : 2} /></div><span className="text-[10px] font-bold">コメント ({(trip.comments || []).length})</span></button>}
        </nav>
      )}

      {showAiChatModal && (
        <AiConciergeChatModal
          trip={trip}
          selectedDate={selectedDate}
          isReadOnly={isReadOnly}
          currentUser={currentUser}
          onClose={() => setShowAiChatModal(false)}
          onAddSuggestedEvent={(evData) => {
            if (isReadOnly) {
              setShowAiChatModal(false);
              setCopyTarget({
                type: 'event',
                data: {
                  id: generateId(),
                  date: selectedDate,
                  time: evData.time || '14:00',
                  title: evData.title,
                  type: evData.type || 'sightseeing',
                  location: evData.location || trip.destination,
                  cost: Number(evData.cost) || 0,
                  memo: evData.memo || '',
                  status: 'approved',
                  authorId: currentUser.id,
                  photos: []
                }
              });
            } else {
              const newEv = {
                id: generateId(),
                date: selectedDate,
                time: evData.time || '14:00',
                title: evData.title,
                type: evData.type || 'sightseeing',
                location: evData.location || trip.destination,
                cost: Number(evData.cost) || 0,
                memo: evData.memo || '',
                status: trip.isSoloTrip ? 'approved' : 'proposed',
                authorId: currentUser.id,
                photos: []
              };
              updateTrip({ ...trip, events: [...(trip.events || []), newEv] });
              customAlert(`「${newEv.title}」をしおりに追加しました！`);
            }
          }}
        />
      )}

      {isSettingsOpen && !isReadOnly && (
        <div className="fixed inset-0 bg-black/45 z-[150] flex justify-end animate-in fade-in" onClick={() => setIsSettingsOpen(false)}>
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right-full pb-safe" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5"><h3 className="font-bold text-base flex items-center gap-2 text-stone-800"><Info size={18} className="text-[#7A9D8C]" /> 旅の管理・設定</h3><button onClick={() => setIsSettingsOpen(false)} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button></div>

            {/* 旅の基本情報（タイトル・行き先・日程）編集セクション */}
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-stone-700 flex items-center gap-1.5">
                <Edit2 size={14} className="text-[#7A9D8C]" /> 旅の基本情報を変更
              </h4>
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">旅行の名前（タイトル）</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="例: 秋の京都・グルメ旅"
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">行き先（都道府県・エリア）</label>
                <input
                  type="text"
                  value={editDestination}
                  onChange={e => setEditDestination(e.target.value)}
                  placeholder="例: 神奈川県・箱根"
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-1">出発日</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={e => {
                      const nextStart = e.target.value;
                      setEditStartDate(nextStart);
                      if (editEndDate < nextStart) setEditEndDate(nextStart);
                    }}
                    className="w-full p-2 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-1">最終日</label>
                  <input
                    type="date"
                    value={editEndDate}
                    min={editStartDate}
                    onChange={e => setEditEndDate(e.target.value)}
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

            {ENABLE_PUBLIC_SNS_FEATURES ? (
              <div className={`mb-6 p-4 border rounded-2xl ${currentUser.isGuest ? 'bg-stone-100 border-stone-200' : 'bg-[#7A9D8C]/10 border-[#7A9D8C]/20'}`}>
                <h4 className={`font-bold text-xs mb-1.5 flex items-center gap-1.5 ${currentUser.isGuest ? 'text-stone-500' : 'text-[#7A9D8C]'}`}><Globe size={15} /> みんなの旅に公開する</h4>
                <p className="text-[10px] text-stone-500 mb-2.5 leading-relaxed">※各予定に貼った写真のうち「公開OK」にした写真や、メモの公開有無を確認画面で選んで投稿できます。</p>
                <button onClick={() => { if (currentUser.isGuest) { customAlert('アカウント登録後にご利用いただけます。'); return; } setIsSettingsOpen(false); setShowPublishModal(true); }} className={`w-full py-2.5 font-bold rounded-xl shadow-sm transition-colors text-xs flex justify-center items-center gap-1.5 ${currentUser.isGuest ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-[#7A9D8C] text-white hover:bg-[#688a79]'}`}>{currentUser.isGuest ? 'ゲストは公開できません' : <><Share2 size={14} /> 公開設定・確認へ進む</>}</button>
              </div>
            ) : (
              SHOW_SNS_COMING_SOON_BANNER && (
                <div className="mb-6 p-4 border border-stone-200 bg-stone-50 rounded-2xl">
                  <h4 className="font-bold text-xs mb-1 flex items-center gap-1.5 text-stone-600">
                    <Globe size={15} className="text-[#7A9D8C]" /> みんなの旅への投稿機能（近日公開）
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-relaxed">
                    作成したしおりを「みんなの旅」に一般公開してシェアできるSNS機能は、今後のアップデートで搭載予定です！現在は招待コードを使って同行メンバーと共有できます。
                  </p>
                </div>
              )
            )}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] text-stone-400 font-bold">参加メンバー ({(trip.members || []).length}人)</label>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">{(trip.members || []).map((m, i) => (<div key={m.id || i} className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 py-1 px-2.5 rounded-full"><UserAvatar user={m} size="w-5 h-5" /><span className="text-xs font-bold text-stone-700">{m.name}</span></div>))}</div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between gap-2 bg-white py-1.5 px-3 rounded-xl border border-stone-200/80">
                  <span className="text-xs font-mono font-extrabold tracking-wider text-stone-700 select-all">{trip.id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(trip.id, `招待コード「${trip.id}」をコピーしました！`)}
                    className="px-2.5 py-1 bg-[#7A9D8C]/15 hover:bg-[#7A9D8C]/25 text-[#557465] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Copy size={12} /> コードのみコピー
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`「${trip.title}」の旅行計画を一緒に作ろう！✈️\n\n▼ 招待コード\n${trip.id}\n\n▼ アプリをまだ持っていない方はこちら（インストールURL）\nhttps://tabitabi.app/dl`, 'アプリ紹介URL付きの招待文をコピーしました！')}
                  className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-[#557465] border border-[#7A9D8C]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Share2 size={13} /> アプリ紹介リンク付きで招待文をコピー
                </button>
              </div>
            </div>
            {(trip.members || []).length === 1 && !trip.isSoloTrip && (<div className="mb-4"><button onClick={() => updateTrip({ ...trip, isSoloTrip: true })} className="w-full py-3 bg-stone-100 text-stone-600 font-bold rounded-xl text-xs flex justify-center items-center gap-2 hover:bg-stone-200 transition-colors">👤 ひとり旅行として確定する（承認省略）</button></div>)}
            {trip.isSoloTrip && (<div className="p-3 bg-stone-100 rounded-xl text-center border border-stone-200 mb-6"><p className="text-xs font-bold text-stone-600">👤 ひとり旅行モード中</p></div>)}

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
        <div className="fixed inset-0 bg-black/60 z-[260] flex justify-center items-center p-4 animate-in fade-in" onClick={() => setShowDeleteConfirmModal(false)}>
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">しおりを削除しますか？</h3>
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 mb-3">
              <p className="text-xs font-bold text-stone-800 truncate">{trip.title}</p>
              <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                {trip.destination || '未設定'} / {(trip.events || []).length}件の予定
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

      {showPublishModal && <PublishModal trip={trip} currentUser={currentUser} onClose={() => setShowPublishModal(false)} onPublish={(p) => { onPublish(p); setShowPublishModal(false); customAlert('「みんなの旅」に公開しました！'); }} />}
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
    { title: 'ウェットティッシュ・除菌シート', category: 'shared' }
  ];

  const packingList = Array.isArray(trip.packingList) ? trip.packingList : [];
  const tripMembers = Array.isArray(trip.members) && trip.members.length > 0 ? trip.members : [currentUser];

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
    const found = tripMembers.find(m => m.id === selectedId) || currentUser;
    return { id: found?.id || currentUser.id, name: found?.name || currentUser.name };
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim() || isReadOnly) return;

    // 「みんなの共用」が選ばれている場合は、追加ボタンを押した時に担当者選択画面を表示する
    if (!trip.isSoloTrip && category === 'shared') {
      setAssigneeModalState({
        mode: 'add',
        title: newItemText.trim(),
        selectedMemberId: assigneeId || currentUser?.id || 'unassigned'
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
      assigneeName: currentUser.name
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
        assigneeName: assigned.name
      };
      updateTrip({ ...trip, packingList: [...packingList, newItem] });
      setNewItemText('');
      customAlert(`「${newItem.title}」を ${assigned.name} さんの担当で追加しました！`);
    } else if (assigneeModalState.mode === 'edit' && assigneeModalState.item) {
      const targetId = assigneeModalState.item.id;
      updateTrip({
        ...trip,
        packingList: packingList.map(item =>
          item.id === targetId
            ? { ...item, assigneeId: assigned.id, assigneeName: assigned.name }
            : item
        )
      });
      customAlert(`「${assigneeModalState.item.title}」の担当を ${assigned.name} に変更しました！`);
    }

    setAssigneeModalState(null);
  };

  const handleAddPresets = () => {
    if (isReadOnly) return;
    const myPersonalTitles = new Set(
      myVisiblePackingList.filter(i => i.category === 'personal').map(i => i.title)
    );
    const sharedTitles = new Set(
      packingList.filter(i => i.category === 'shared').map(i => i.title)
    );

    const additions = DEFAULT_PACKING_PRESETS
      .filter(p => {
        const cat = trip.isSoloTrip ? 'personal' : p.category;
        return cat === 'shared' ? !sharedTitles.has(p.title) : !myPersonalTitles.has(p.title);
      })
      .map(p => {
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
          assigneeName: currentUser.name
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
      packingList: packingList.map(item => {
        if (item.id !== id) return item;
        if (item.category === 'shared') {
          return { ...item, checked: !item.checked };
        }
        const currentChecked = isItemCheckedForMe(item);
        return {
          ...item,
          checked: !currentChecked,
          checkedBy: { ...(item.checkedBy || {}), [currentUser.id]: !currentChecked }
        };
      })
    });
  };

  const handleDeleteItem = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      packingList: packingList.filter(item => item.id !== id)
    });
  };

  const filteredItems = myVisiblePackingList.filter(item => {
    if (filterTab === 'all') return true;
    return item.category === filterTab;
  });

  const checkedCount = myVisiblePackingList.filter(isItemCheckedForMe).length;
  const progressPercent = myVisiblePackingList.length > 0 ? Math.round((checkedCount / myVisiblePackingList.length) * 100) : 0;

  return (
    <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
      {/* 準備進捗カード */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-bold text-sm text-stone-800 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#7A9D8C]" /> 持ち物チェックリスト
            </h3>
            <p className="text-[11px] text-stone-400 font-bold mt-0.5">
              {trip.isSoloTrip
                ? '忘れ物がないようにチェックしましょう'
                : '👤 各自の持ち物はあなた専用（他メンバーと独立）で管理されます'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-[#7A9D8C]">{progressPercent}%</span>
            <p className="text-[10px] font-bold text-stone-400">{checkedCount}/{myVisiblePackingList.length} 完了</p>
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
              <Sparkles size={12} className="text-amber-500" /> 定番セットを一括追加
            </button>
            {checkedCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  updateTrip({
                    ...trip,
                    packingList: packingList.map(item => {
                      if (!isItemVisibleForMe(item)) return item;
                      if (item.category === 'shared') return { ...item, checked: false };
                      return {
                        ...item,
                        checked: false,
                        checkedBy: { ...(item.checkedBy || {}), [currentUser.id]: false }
                      };
                    })
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
        <form onSubmit={handleAddItem} className="bg-white p-4 rounded-2xl shadow-xs border border-stone-100 space-y-2.5">
          {!trip.isSoloTrip && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex bg-stone-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCategory('personal')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    category === 'personal' ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  👤 各自の持ち物
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('shared')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    category === 'shared' ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-500'
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
              onChange={e => setNewItemText(e.target.value)}
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
            { id: 'personal', label: `👤 自分専用 (${myVisiblePackingList.filter(i => i.category === 'personal').length})` },
            { id: 'shared', label: `👥 みんなの共用 (${myVisiblePackingList.filter(i => i.category === 'shared').length})` }
          ].map(t => (
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
          <p className="text-xs font-bold text-stone-500 mb-1">まだ持ち物が登録されていません</p>
          <p className="text-[11px] text-stone-400">上の「定番セットを一括追加」または入力欄から追加できます</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map(item => {
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
                      isChecked ? 'bg-[#7A9D8C] border-[#7A9D8C] text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={13} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isChecked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
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
                                  selectedMemberId: item.assigneeId || currentUser?.id || 'unassigned'
                                });
                              }
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/70 inline-flex items-center gap-1 transition-colors active:scale-95"
                            title="タップして担当者を変更"
                          >
                            <span>👥 共用（担当: {item.assigneeName || '未定'}）</span>
                            {!isReadOnly && <Edit2 size={10} className="opacity-70" />}
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
            onClick={e => e.stopPropagation()}
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
              <p className="text-[10px] font-bold text-stone-400 mb-0.5">対象の共用アイテム</p>
              <p className="text-xs font-extrabold text-stone-800 truncate">
                👥 {assigneeModalState.mode === 'add' ? assigneeModalState.title : assigneeModalState.item?.title}
              </p>
            </div>

            <p className="text-[11px] font-bold text-stone-500 mb-2.5 pl-1">
              参加しているメンバーから担当者を選んでください
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar mb-4">
              {tripMembers.map((member, idx) => {
                const isSelected = assigneeModalState.selectedMemberId === member.id;
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
                        isSelected ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white' : 'border-stone-300'
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
                    <p className="text-xs font-extrabold text-stone-700">未定（あとでみんなで決める）</p>
                    <p className="text-[10px] text-stone-400 font-bold">担当者を指定せずにリストへ追加します</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    assigneeModalState.selectedMemberId === 'unassigned' ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white' : 'border-stone-300'
                  }`}
                >
                  {assigneeModalState.selectedMemberId === 'unassigned' && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAssigneeModalState(null)}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-xs transition-colors"
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

  const SOUVENIR_TARGETS = ['自分用', '家族・実家', '職場・学校', '友達', 'その他'];
  const QUICK_SOUVENIR_PRESETS = [
    { label: '＋ 職場・ばらまき用 (¥3,000)', target: '職場・学校', title: '職場・ばらまき用お菓子', amount: 3000 },
    { label: '＋ 家族・実家用 (¥3,000)', target: '家族・実家', title: '家族・実家用おみやげ', amount: 3000 },
    { label: '＋ 友達用 (¥2,000)', target: '友達', title: '友達用おみやげ', amount: 2000 },
    { label: '＋ 自分へのご褒美 (¥3,000)', target: '自分用', title: '自分用ご当地グルメ・雑貨', amount: 3000 }
  ];

  const events = Array.isArray(trip.events) ? trip.events : [];
  const extraExpenses = Array.isArray(trip.extraExpenses) ? trip.extraExpenses : [];
  const souvenirList = Array.isArray(trip.souvenirList) ? trip.souvenirList : [];
  const memberCount = Math.max(1, (trip.members || []).length);

  // タイムラインの予定から自動計算
  const approvedEventCost = events
    .filter(e => e.status !== 'proposed')
    .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  const proposedEventCost = events
    .filter(e => e.status === 'proposed')
    .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  const eventsOnlyTotal = approvedEventCost + proposedEventCost;
  const souvenirCostTotal = isReadOnly ? 0 : souvenirList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const extraCostTotal = isReadOnly ? 0 : extraExpenses.reduce((sum, ex) => sum + (Number(ex.amount) || 0), 0);

  const totalEstimated = isReadOnly ? eventsOnlyTotal : (eventsOnlyTotal + souvenirCostTotal + extraCostTotal);
  const targetBudget = Number(trip.budget) || 0;
  const remaining = targetBudget - totalEstimated;
  const usageRatio = targetBudget > 0 ? Math.min(100, Math.round((totalEstimated / targetBudget) * 100)) : 0;
  const isOverBudget = targetBudget > 0 && totalEstimated > targetBudget;

  // カテゴリ別集計（閲覧専用＝みんなの旅では予定内の金額のみ集計し、おみやげ枠は除外）
  const categoryBreakdown = useMemo(() => {
    const map = { meal: 0, sightseeing: 0, transport: 0, active: 0, hotel: 0, souvenir: souvenirCostTotal };
    events.forEach(ev => {
      const c = Number(ev.cost) || 0;
      if (c > 0) {
        const key = map[ev.type] !== undefined ? ev.type : 'sightseeing';
        map[key] += c;
      }
    });
    if (!isReadOnly) {
      extraExpenses.forEach(ex => {
        const c = Number(ex.amount) || 0;
        if (c > 0) {
          const key = map[ex.category] !== undefined ? ex.category : 'sightseeing';
          map[key] += c;
        }
      });
    }
    const categories = isReadOnly
      ? QUICK_TAGS
      : [...QUICK_TAGS, { id: 'souvenir', label: '🎁 おみやげ', icon: Heart }];
    return categories.map(tag => ({
      ...tag,
      amount: map[tag.id] || 0,
      percent: totalEstimated > 0 ? Math.round(((map[tag.id] || 0) / totalEstimated) * 100) : 0
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
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-extrabold text-stone-900">
                ¥{eventsOnlyTotal.toLocaleString()}<span className="text-sm font-bold text-stone-500 ml-0.5">/人</span>
              </span>
              <span className="text-xs font-extrabold text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-1 rounded-full">
                × {memberCount}人 {memberCount > 1 ? `（計 ¥${(eventsOnlyTotal * memberCount).toLocaleString()}）` : ''}
              </span>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
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
            <p className="text-xs text-stone-400 font-bold text-center py-6">予定が登録されていません</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {events.map((ev, idx) => {
                const tagInfo = QUICK_TAGS.find(t => t.id === ev.type) || QUICK_TAGS[2];
                const TagIcon = tagInfo.icon;
                const costNum = Number(ev.cost) || 0;
                return (
                  <div key={ev.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-xl bg-[#7A9D8C]/10 text-[#7A9D8C] flex items-center justify-center shrink-0">
                        <TagIcon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-800 truncate">{ev.title}</p>
                        <p className="text-[10px] text-stone-400 font-bold">
                          {ev.date ? `${ev.date.slice(5).replace('-', '/')} ` : ''}{ev.time || ''} {ev.location ? `・ ${ev.location}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-extrabold ${costNum > 0 ? 'text-stone-800' : 'text-stone-400'}`}>
                        {costNum > 0 ? `¥${costNum.toLocaleString()}/人` : '¥0'}
                      </span>
                      {costNum > 0 && (
                        <span className="text-[10px] font-bold text-[#557465] ml-1">
                          ×{memberCount}人
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* カテゴリ別の費用内訳 */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
          <h4 className="font-bold text-xs text-stone-700 mb-3 flex items-center gap-1.5">
            <Activity size={14} className="text-[#7A9D8C]" /> カテゴリ別の費用内訳
          </h4>
          <div className="space-y-2.5">
            {categoryBreakdown.map(cat => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <CatIcon size={13} className="text-[#7A9D8C]" /> {cat.label}
                    </span>
                    <span className="text-stone-800">
                      ¥{cat.amount.toLocaleString()} <span className="text-[10px] text-stone-400">({cat.percent}%)</span>
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
      purchased: false
    };
    updateTrip({ ...trip, souvenirList: [...souvenirList, newItem] });
    setSouvenirTitle('');
    setSouvenirAmount('');
    customAlert(`「${finalTitle} (¥${amountNum.toLocaleString()})」をおみやげ予算に追加しました！`);
  };

  const handleQuickAddSouvenir = (preset) => {
    if (isReadOnly) return;
    const newItem = {
      id: generateId(),
      target: preset.target,
      title: preset.title,
      amount: preset.amount,
      purchased: false
    };
    updateTrip({ ...trip, souvenirList: [...souvenirList, newItem] });
    customAlert(`「${preset.title} (¥${preset.amount.toLocaleString()})」を追加しました！`);
  };

  const handleSetRoughSouvenirBudget = (roughAmount) => {
    if (isReadOnly) return;
    const newItem = {
      id: generateId(),
      target: 'その他',
      title: 'おみやげ予算枠（まとめ予算）',
      amount: roughAmount,
      purchased: false
    };
    updateTrip({ ...trip, souvenirList: [...souvenirList, newItem] });
    customAlert(`おみやげ予算枠として ¥${roughAmount.toLocaleString()} を追加しました！`);
  };

  const handleToggleSouvenirPurchased = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      souvenirList: souvenirList.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item)
    });
  };

  const handleDeleteSouvenir = (id) => {
    if (isReadOnly) return;
    updateTrip({
      ...trip,
      souvenirList: souvenirList.filter(item => item.id !== id)
    });
  };

  const handleAddExtraExpense = (e) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!expenseTitle.trim() || !amountNum || amountNum <= 0 || isReadOnly) return;
    const newExp = {
      id: generateId(),
      title: expenseTitle.trim(),
      amount: amountNum,
      category: expenseCategory,
      paidBy: currentUser?.name || 'メンバー',
      createdAt: getTodayString()
    };
    updateTrip({ ...trip, extraExpenses: [newExp, ...extraExpenses] });
    setExpenseTitle('');
    setExpenseAmount('');
    customAlert('出費メモを追加しました');
  };

  const handleDeleteExtraExpense = (id) => {
    if (isReadOnly) return;
    updateTrip({ ...trip, extraExpenses: extraExpenses.filter(ex => ex.id !== id) });
  };

  return (
    <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
      {/* 予算サマリーカード */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[11px] font-bold text-stone-400 block mb-0.5">現在の予定＋おみやげ＋出費合計（1人あたり × 参加人数）</span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-2xl font-extrabold ${isOverBudget ? 'text-red-500' : 'text-stone-900'}`}>
                ¥{totalEstimated.toLocaleString()}<span className="text-xs font-bold text-stone-500 ml-0.5">/人</span>
              </span>
              <span className="text-xs font-extrabold text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full">
                × {memberCount}人 {memberCount > 1 ? `（全員計 ¥${(totalEstimated * memberCount).toLocaleString()}）` : ''}
              </span>
              {targetBudget > 0 && (
                <span className="text-xs font-bold text-stone-400">
                  / 1人予算 ¥{targetBudget.toLocaleString()}
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
              onChange={e => setBudgetDraft(e.target.value)}
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
                  isOverBudget ? 'bg-red-500' : usageRatio > 85 ? 'bg-amber-500' : 'bg-[#7A9D8C]'
                }`}
                style={{ width: `${usageRatio}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-stone-400">消化率 {usageRatio}%</span>
              {remaining >= 0 ? (
                <span className="text-[#557465]">あと ¥{remaining.toLocaleString()} 余裕あり</span>
              ) : (
                <span className="text-red-500">予算を ¥{Math.abs(remaining).toLocaleString()} オーバー中</span>
              )}
            </div>
          </>
        )}

        {/* 確定分 / 提案中 / おみやげ / その他 の4分割内訳 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-stone-100 text-center">
          <div className="bg-stone-50 p-2.5 rounded-2xl">
            <p className="text-[10px] font-bold text-stone-400 mb-0.5">確定した予定</p>
            <p className="text-xs font-extrabold text-stone-800">¥{approvedEventCost.toLocaleString()}</p>
          </div>
          <div className="bg-amber-50/70 p-2.5 rounded-2xl">
            <p className="text-[10px] font-bold text-amber-700 mb-0.5">💡 提案中の予定</p>
            <p className="text-xs font-extrabold text-amber-800">¥{proposedEventCost.toLocaleString()}</p>
          </div>
          <div className="bg-rose-50/70 p-2.5 rounded-2xl border border-rose-100/80">
            <p className="text-[10px] font-bold text-rose-600 mb-0.5">🎁 おみやげ予算</p>
            <p className="text-xs font-extrabold text-rose-700">¥{souvenirCostTotal.toLocaleString()}</p>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl">
            <p className="text-[10px] font-bold text-stone-400 mb-0.5">その他の出費</p>
            <p className="text-xs font-extrabold text-stone-800">¥{extraCostTotal.toLocaleString()}</p>
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
            <span className="text-sm font-extrabold text-rose-600">¥{souvenirCostTotal.toLocaleString()}</span>
            <p className="text-[10px] font-bold text-stone-400">{souvenirList.length}件</p>
          </div>
        </div>

        {!isReadOnly && (
          <>
            {/* ざっくりおみやげ予算枠ボタン＆定番プリセット */}
            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/80 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-rose-700">⚡ ざっくりおみやげ予算枠を追加：</span>
                <div className="flex gap-1.5">
                  {[3000, 5000, 10000].map(amt => (
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
                <span className="text-[10px] font-bold text-stone-500 block mb-1.5">渡す相手別・ワンタップ追加：</span>
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
                {SOUVENIR_TARGETS.map(target => (
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
                  onChange={e => setSouvenirTitle(e.target.value)}
                  placeholder={`${souvenirTarget}のおみやげ名 (省略可)`}
                  className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="number"
                  value={souvenirAmount}
                  onChange={e => setSouvenirAmount(e.target.value)}
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
            {souvenirList.map(item => (
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
                      item.purchased ? 'bg-rose-500 border-rose-500 text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {item.purchased && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 shrink-0">
                        {item.target}
                      </span>
                      <p className={`text-xs font-bold truncate ${item.purchased ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-rose-600">¥{Number(item.amount).toLocaleString()}</span>
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
          {categoryBreakdown.map(cat => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <CatIcon size={13} className={cat.id === 'souvenir' ? 'text-rose-500' : 'text-[#7A9D8C]'} /> {cat.label}
                  </span>
                  <span className="text-stone-800">
                    ¥{cat.amount.toLocaleString()} <span className="text-[10px] text-stone-400">({cat.percent}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.id === 'souvenir' ? 'bg-rose-400' : 'bg-[#7A9D8C]/80'}`}
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
            <Banknote size={14} className="text-[#7A9D8C]" /> タイムライン外の出費メモを追加
          </h4>
          <form onSubmit={handleAddExtraExpense} className="space-y-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {QUICK_TAGS.map(tag => {
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
                onChange={e => setExpenseTitle(e.target.value)}
                placeholder="項目（例：コインロッカー・飲み物）"
                className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
              <input
                type="number"
                value={expenseAmount}
                onChange={e => setExpenseAmount(e.target.value)}
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
              {extraExpenses.map(ex => (
                <div key={ex.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-stone-50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-stone-800">{ex.title}</span>
                    <span className="text-[10px] text-stone-400 ml-2">({ex.paidBy})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-stone-700">¥{Number(ex.amount).toLocaleString()}</span>
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

function CopyModal({ type, sourceData, currentUser, myTrips, onClose, onOpenRegister, onComplete }) {
  useLockBodyScroll(true);
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
    return (myTrips || []).filter(t => {
      const endDate = t.endDate || t.startDate || '';
      if (endDate < todayStr) return false; // 過去のしおりは除外
      return copyMode === 'solo' ? Boolean(t.isSoloTrip) : !t.isSoloTrip;
    });
  }, [myTrips, copyMode, todayStr]);

  const [selectedTripId, setSelectedTripId] = useState(() => {
    if (type === 'trip') return 'new';
    const initialSoloTrips = (myTrips || []).filter(t => (t.endDate || t.startDate || '') >= todayStr && Boolean(t.isSoloTrip));
    return initialSoloTrips.length > 0 ? initialSoloTrips[0].id : 'new';
  });

  // スタイル切り替え時、選択中のしおりが現在のスタイルに含まれない場合は自動でリセット
  useEffect(() => {
    if (selectedTripId !== 'new' && !filteredTargetTrips.some(t => t.id === selectedTripId)) {
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
    type === 'event' ? (sourceData.time || '12:00') : '12:00'
  );
  const [customEventTimesMap, setCustomEventTimesMap] = useState(() => {
    const initialMap = {};
    const list = type === 'trip' ? (sourceData.events || []) : (type === 'day' ? (sourceData || []) : []);
    list.forEach((ev, idx) => {
      initialMap[ev.id || idx] = ev.time || '12:00';
    });
    return initialMap;
  });

  const targetTrip = myTrips.find(t => t.id === selectedTripId);

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
    if (targetTrip) return generateDateList(targetTrip.startDate, targetTrip.endDate);
    return [getTodayString()];
  }, [selectedTripId, targetTrip, newStartDate]);

  const [selectedDate, setSelectedDate] = useState(targetDates[0] || getTodayString());

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
        const origStart = parseSafeDate(sourceData.startDate || getTodayString());
        const origEnd = parseSafeDate(sourceData.endDate || sourceData.startDate || getTodayString());
        const diffDays = Math.max(0, Math.round((origEnd - origStart) / (1000 * 60 * 60 * 24)));
        const end = new Date(start);
        end.setDate(end.getDate() + diffDays);
        const endStr = end.toISOString().split('T')[0];

        const shiftedEvents = (sourceData.events || []).map((ev, idx) => {
          const evDate = parseSafeDate(ev.date || sourceData.startDate || getTodayString());
          const dayOffset = Math.max(0, Math.round((evDate - origStart) / (1000 * 60 * 60 * 24)));
          const newEvDate = new Date(start);
          newEvDate.setDate(newEvDate.getDate() + dayOffset);
          return {
            ...ev,
            id: generateId(),
            date: newEvDate.toISOString().split('T')[0],
            time: customEventTimesMap[ev.id || idx] || ev.time || '12:00',
            status: isSoloMode ? 'approved' : 'proposed',
            authorId: currentUser.id,
            photos: []
          };
        });

        const totalEventsCost = shiftedEvents.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);

        const newTripObj = {
          id: generateTripCode(),
          title: newTripTitle.trim() || `${sourceData.title || '旅行計画'}（コピー）`,
          destination: sourceData.destination || '未設定',
          startDate: newStartDate,
          endDate: endStr,
          budget: totalEventsCost > 0 ? totalEventsCost : (Number(sourceData.budget) || 50000),
          members: buildNewTripMembers(),
          isSoloTrip: isSoloMode,
          events: shiftedEvents,
          photos: [],
          packingList: [],
          extraExpenses: [],
          souvenirList: []
        };

        if (!isSoloMode) {
          setCreatedGroupTrip(newTripObj);
          setStep(2);
          return;
        }
        onComplete(newTripObj, null);
      } else if (targetTrip) {
        const origStart = parseSafeDate(sourceData.startDate || getTodayString());
        const targetStart = parseSafeDate(targetTrip.startDate);
        const targetEnd = parseSafeDate(targetTrip.endDate);

        const mergedEvents = (sourceData.events || []).map((ev, idx) => {
          const evDate = parseSafeDate(ev.date || sourceData.startDate || getTodayString());
          const dayOffset = Math.max(0, Math.round((evDate - origStart) / (1000 * 60 * 60 * 24)));
          const mappedDate = new Date(targetStart);
          mappedDate.setDate(mappedDate.getDate() + dayOffset);
          const finalDate = mappedDate <= targetEnd ? mappedDate.toISOString().split('T')[0] : targetTrip.endDate;
          return {
            ...ev,
            id: generateId(),
            date: finalDate,
            time: customEventTimesMap[ev.id || idx] || ev.time || '12:00',
            status: targetTrip.isSoloTrip ? 'approved' : 'proposed',
            authorId: currentUser.id,
            photos: []
          };
        });

        onComplete(null, { ...targetTrip, events: [...(targetTrip.events || []), ...mergedEvents] });
      }
      return;
    }

    const rawEvents = type === 'event' ? [sourceData] : (Array.isArray(sourceData) ? sourceData : []);

    if (selectedTripId === 'new') {
      const newEvents = rawEvents.map((e, idx) => ({
        ...e,
        id: generateId(),
        date: newStartDate,
        time: type === 'event' ? customEventTime : (customEventTimesMap[e.id || idx] || e.time || '12:00'),
        status: isSoloMode ? 'approved' : 'proposed',
        authorId: currentUser.id
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
        photos: []
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
        time: type === 'event' ? customEventTime : (customEventTimesMap[e.id || idx] || e.time || '12:00'),
        status: targetTrip.isSoloTrip ? 'approved' : 'proposed',
        authorId: currentUser.id
      }));
      onComplete(null, { ...targetTrip, events: [...(targetTrip.events || []), ...newEvents] });
    }
  };

  const multiEventsList = type === 'trip' ? (sourceData.events || []) : (type === 'day' ? (sourceData || []) : []);

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
    copyToClipboard(
      inviteText,
      'アプリ紹介URL付きの招待文をコピーしました！'
    );
    setCopiedInviteMsg(true);
    setTimeout(() => setCopiedInviteMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 max-h-[88vh] flex flex-col pb-safe" onClick={e => e.stopPropagation()}>
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
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button>
        </div>

        {step === 2 && createdGroupTrip ? (
          <div className="space-y-5 text-center animate-in slide-in-from-right-4 py-2">
            <div className="bg-[#7A9D8C]/10 p-5 rounded-3xl border border-[#7A9D8C]/20">
              <p className="text-xs font-bold text-[#7A9D8C] mb-2">コピーしたしおりの共有・招待コード</p>
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
                <span>{copiedInviteMsg ? '招待文をコピーしました！' : 'アプリ紹介リンク付きで招待文をコピー'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              友達やパートナーにこのコードを共有すると、<br />コピーしたしおりを一緒に編集できるようになります。<br />
              <span className="text-[11px] text-stone-400">（※しおり右上のメニューからいつでも再確認できます）</span>
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
                <p className="text-[10px] font-bold text-stone-400 mb-0.5">コピーする内容</p>
                <p className="text-xs font-bold text-stone-700 truncate">
                  {type === 'trip'
                    ? `${sourceData.title}（全${(sourceData.events || []).length}件の予定）`
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
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${copyMode === 'solo' ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white' : 'border-stone-300'}`}>
                        {copyMode === 'solo' && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className={`text-xs font-extrabold ${copyMode === 'solo' ? 'text-[#557465]' : 'text-stone-800'}`}>
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
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${copyMode === 'group' ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white' : 'border-stone-300'}`}>
                        {copyMode === 'group' && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className={`text-xs font-extrabold ${copyMode === 'group' ? 'text-[#557465]' : 'text-stone-800'}`}>
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
                    <label className="text-[10px] font-bold text-stone-400 block mb-1">新しいしおりの名前</label>
                    <input
                      type="text"
                      value={newTripTitle}
                      onChange={e => setNewTripTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 block mb-1">出発日</label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={e => setNewStartDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2 pl-1">
                  <label className="block text-xs font-bold text-stone-500">
                    コピー先のしおり（{copyMode === 'solo' ? '👤 1人旅のみ' : '👥 参加中の共有しおりのみ'}）
                  </label>
                  <span className="text-[10px] font-bold text-stone-400">※過去の旅は非表示</span>
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
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${selectedTripId === 'new' ? 'bg-[#7A9D8C] text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
                        <Plus size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">新しいしおりを作成してコピー</p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {copyMode === 'solo' ? '👤 1人旅のしおりとして新規作成' : '👥 みんなの旅（複数人用）として新規作成'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedTripId === 'new' ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white' : 'border-stone-300'}`}>
                      {selectedTripId === 'new' && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>

                  {filteredTargetTrips.length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-center text-[11px] font-bold text-stone-400">
                      {copyMode === 'solo'
                        ? '進行中・これからの「1人旅のしおり」はありません'
                        : '進行中・これからの「共有のしおり（みんなの旅）」はありません'}
                    </div>
                  ) : (
                    filteredTargetTrips.map(t => {
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
                              <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#557465]' : 'text-stone-800'}`}>{t.title}</p>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 shrink-0">
                                {t.isSoloTrip ? '👤 1人旅' : `👥 共有（${(t.members || []).length}人）`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold mt-0.5">
                              <span className="flex items-center gap-0.5"><MapPin size={10} />{t.destination || '未設定'}</span>
                              <span className="flex items-center gap-0.5"><Calendar size={10} />{t.startDate?.replace(/-/g, '/')}〜</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white' : 'border-stone-300'}`}>
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
                  <label className="block text-xs font-bold text-stone-500 mb-2 pl-1">追加する日程（何日目）を選択</label>
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
                      onChange={e => setCustomEventTime(e.target.value)}
                      className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                ) : (
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2 max-h-44 overflow-y-auto no-scrollbar">
                    {multiEventsList.length === 0 ? (
                      <p className="text-[11px] text-stone-400 font-bold text-center py-2">コピー対象の予定がありません</p>
                    ) : (
                      multiEventsList.map((ev, idx) => {
                        const key = ev.id || idx;
                        return (
                          <div key={key} className="bg-white p-2.5 rounded-xl border border-stone-100 flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-stone-700 truncate flex-1">{ev.title}</span>
                            <input
                              type="time"
                              value={customEventTimesMap[key] || ev.time || '12:00'}
                              onChange={e => setCustomEventTimesMap(prev => ({ ...prev, [key]: e.target.value }))}
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
                    ? (copyMode === 'solo' ? '👤 1人旅としてコピーする' : '次へ（招待コードを表示）')
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

function Timeline({ trip, updateTrip, selectedDate, currentUser, isReadOnly, onCopyEvent, onCopyDay, onEnlargeImage, onOpenAiChat }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [insertIndex, setInsertIndex] = useState(null);
  const [insertDefaultTime, setInsertDefaultTime] = useState(null);
  const [insertRouteContext, setInsertRouteContext] = useState(null);
  const [showAiSuggestModal, setShowAiSuggestModal] = useState(false);
  const [aiInitialData, setAiInitialData] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const eventRefsMap = useRef({});

  // 30秒ごとに現在時刻を再計算してリアルタイムにポワンポワン位置を更新
  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const currentEvents = (trip.events || []).filter(e => e.date === selectedDate);
  currentEvents.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const timeToMinutes = (t) => {
    if (!t || !t.includes(':')) return null;
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  // ★ 今日の日付と選択中の日付が一致している日のみ、現在時刻に一番近い予定＆進行度（Yahoo!乗換案内風）を算出する
  const isTodaySelected = selectedDate === getTodayString();
  const nowDateObj = new Date(nowTick);
  const currentNowMinutes = nowDateObj.getHours() * 60 + nowDateObj.getMinutes();
  const currentNowTimeStr = `${String(nowDateObj.getHours()).padStart(2, '0')}:${String(nowDateObj.getMinutes()).padStart(2, '0')}`;

  const closestEventId = useMemo(() => {
    if (!isTodaySelected || currentEvents.length === 0) return null;
    let bestId = currentEvents[0].id;
    let minDiff = Infinity;
    currentEvents.forEach(ev => {
      const evMinutes = timeToMinutes(ev.time);
      if (evMinutes === null) return;
      const diff = Math.abs(evMinutes - currentNowMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        bestId = ev.id;
      }
    });
    return bestId;
  }, [currentEvents, selectedDate, isTodaySelected, currentNowMinutes]);

  // 今日の日付と一致しているときのみ、現在時刻に一番近い予定まで自動でスクロールする
  useEffect(() => {
    if (!isTodaySelected || !closestEventId) return;
    const timer = setTimeout(() => {
      const targetEl = eventRefsMap.current[closestEventId];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [trip.id, selectedDate, closestEventId, isTodaySelected]);

  // 2つの予定の時間から中間の時間を計算する関数（例: 10:30 と 12:00 → 11:15）
  const getMidpointTime = (timeA, timeB) => {
    const toMinutes = (t) => {
      if (!t || !t.includes(':')) return 12 * 60;
      const [h, m] = t.split(':').map(Number);
      return (isNaN(h) ? 12 : h) * 60 + (isNaN(m) ? 0 : m);
    };
    const minA = toMinutes(timeA);
    const minB = timeB ? toMinutes(timeB) : minA + 60;
    const mid = minB > minA ? Math.round((minA + minB) / 2) : Math.min(23 * 60 + 55, minA + 30);
    const roundedMid = Math.round(mid / 5) * 5;
    const hh = String(Math.floor(roundedMid / 60) % 24).padStart(2, '0');
    const mm = String(roundedMid % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleOpenInsertBetween = (idx, prevEvent, nextEvent) => {
    const midTime = getMidpointTime(prevEvent?.time, nextEvent?.time);
    setInsertIndex(idx);
    setInsertDefaultTime(midTime);
    setInsertRouteContext({
      time: midTime,
      prevTitle: prevEvent?.title || '',
      prevLocation: prevEvent?.location || prevEvent?.title || '',
      prevTime: prevEvent?.time || '',
      nextTitle: nextEvent?.title || '',
      nextLocation: nextEvent?.location || nextEvent?.title || '',
      nextTime: nextEvent?.time || ''
    });
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
      isPublic: true
    };
    const updatedEvents = (trip.events || []).map(ev => {
      if (ev.id === eventId) {
        return { ...ev, photos: [...(ev.photos || []), newPhotoObj] };
      }
      return ev;
    });
    const updatedTripPhotos = [newPhotoObj, ...(trip.photos || [])];
    updateTrip({ ...trip, events: updatedEvents, photos: updatedTripPhotos });
    customAlert('予定に思い出の写真を追加しました！');
  };

  const handleToggleEventPhotoPublic = (eventId, photoId) => {
    const updatedEvents = (trip.events || []).map(ev => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        photos: (ev.photos || []).map(p =>
          p.id === photoId ? { ...p, isPublic: p.isPublic === false ? true : false } : p
        )
      };
    });
    updateTrip({ ...trip, events: updatedEvents });
  };

  const handleDeleteEventPhoto = (eventId, photoId) => {
    const updatedEvents = (trip.events || []).map(ev => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        photos: (ev.photos || []).filter(p => p.id !== photoId)
      };
    });
    const updatedTripPhotos = (trip.photos || []).filter(p => p.id !== photoId);
    updateTrip({ ...trip, events: updatedEvents, photos: updatedTripPhotos });
    customAlert('思い出写真を削除しました');
  };

  return (
    <div className="p-4 sm:p-5 pb-28">
      {isReadOnly && currentEvents.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button onClick={() => onCopyDay(currentEvents)} className="px-3 py-1.5 bg-[#7A9D8C]/10 text-[#7A9D8C] rounded-full text-xs font-bold flex items-center gap-1 hover:bg-[#7A9D8C]/20 transition-colors">
            <Copy size={12} /> この日の予定をコピー
          </button>
        </div>
      )}

      <div className="relative pt-1">
        {/* 左側の時間軸の縦線（時刻のすぐ右を貫くライン） */}
        {(currentEvents.length > 0 || showAddForm || insertIndex !== null) && (
          <div className="absolute left-[47px] top-3 bottom-3 w-[2px] bg-stone-200/90 rounded-full pointer-events-none" />
        )}

        <div className="space-y-1.5">
          {currentEvents.length === 0 && !showAddForm && insertIndex === null ? (
            <div className="text-stone-400 text-xs font-bold py-12 flex flex-col items-center justify-center gap-1.5 bg-white/70 rounded-3xl border border-dashed border-stone-200">
              <Compass size={24} className="opacity-40 mb-0.5 text-[#7A9D8C]" />
              <span>この日の予定はまだありません。</span>
            </div>
          ) : (
            currentEvents.map((event, idx) => {
              const nextEvent = currentEvents[idx + 1];
              const suggestedMidTime = nextEvent ? getMidpointTime(event.time, nextEvent.time) : null;
              const isClosestNow = event.id === closestEventId;
              const canInsertAfter = !isReadOnly && idx < currentEvents.length - 1;

              // Yahoo!乗換案内風：現在時刻がこの予定と次の予定の間の区間に位置しているか判定（0.0〜1.0の進行度）
              const evMin = timeToMinutes(event.time);
              const nextMin = nextEvent ? timeToMinutes(nextEvent.time) : null;
              const isPassedEvent = isTodaySelected && evMin !== null && currentNowMinutes > evMin;
              const isBetweenThisAndNext =
                isTodaySelected &&
                evMin !== null &&
                nextMin !== null &&
                nextMin > evMin &&
                currentNowMinutes > evMin &&
                currentNowMinutes < nextMin;
              const betweenProgress = isBetweenThisAndNext
                ? Math.min(0.86, Math.max(0.18, (currentNowMinutes - evMin) / (nextMin - evMin)))
                : null;

              return (
                <React.Fragment key={event.id}>
                  <div
                    ref={el => {
                      if (el) eventRefsMap.current[event.id] = el;
                    }}
                  >
                    <EventCard
                      event={event}
                      trip={trip}
                      isReadOnly={isReadOnly}
                      currentUser={currentUser}
                      isClosestNow={isClosestNow}
                      isPassedEvent={isPassedEvent}
                      betweenNowProgress={betweenProgress}
                      currentNowTimeStr={currentNowTimeStr}
                      insertButtonSlot={
                        canInsertAfter && insertIndex !== idx ? (
                          <button
                            type="button"
                            onClick={() => handleOpenInsertBetween(idx, event, nextEvent)}
                            className="group/ins relative flex items-center focus:outline-none select-none"
                            title={`${suggestedMidTime ? `${suggestedMidTime}頃に` : ''}この間に予定を追加・AI提案`}
                          >
                            {/* 左のピル型バッジ（時刻＋追加アイコン） */}
                            <div className="flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-full bg-white group-hover/ins:bg-[#7A9D8C] text-[#557465] group-hover/ins:text-white border border-[#7A9D8C]/55 group-hover/ins:border-[#7A9D8C] shadow-xs transition-all active:scale-95 z-10">
                              <span className="text-[9px] font-mono font-extrabold tracking-tighter leading-none">
                                {suggestedMidTime || ''}
                              </span>
                              <span className="w-3.5 h-3.5 rounded-full bg-[#7A9D8C]/15 group-hover/ins:bg-white/25 flex items-center justify-center">
                                <Plus size={10} strokeWidth={3} className="text-[#7A9D8C] group-hover/ins:text-white" />
                              </span>
                            </div>

                            {/* 右の予定カードと予定カードの「ちょうど間」へスッと伸びる点線コネクタ＆追加ラベル */}
                            <div className="flex items-center pointer-events-none">
                              <div className="w-3 border-t-2 border-dashed border-[#7A9D8C]/55 group-hover/ins:border-[#7A9D8C] transition-colors" />
                              <span className="px-1.5 py-0.2 rounded-full bg-[#F4F7F5] group-hover/ins:bg-[#7A9D8C] text-[9px] font-extrabold text-[#557465] group-hover/ins:text-white border border-[#7A9D8C]/35 transition-all whitespace-nowrap shadow-2xs">
                                ＋ここに予定を追加
                              </span>
                            </div>
                          </button>
                        ) : null
                      }
                      onApprove={() => updateTrip({ ...trip, events: (trip.events || []).map(e => e.id === event.id ? { ...e, status: 'approved' } : e) })}
                      onUpdateEvent={(updatedFields) => updateTrip({ ...trip, events: (trip.events || []).map(e => e.id === event.id ? { ...e, ...updatedFields } : e) })}
                      onUpdateMemo={(newMemo) => updateTrip({ ...trip, events: (trip.events || []).map(e => e.id === event.id ? { ...e, memo: newMemo } : e) })}
                      onDelete={() => setEventToDelete(event)}
                      onCopy={() => onCopyEvent(event)}
                      onAddPhoto={(url) => handleAddEventPhoto(event.id, url)}
                      onTogglePhotoPublic={(photoId) => handleToggleEventPhotoPublic(event.id, photoId)}
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
                  </div>

                  {/* 予定間の「＋」ボタンを押した時だけ展開されるインライン追加フォーム */}
                  {canInsertAfter && insertIndex === idx && (
                    <div className="pl-[56px] py-1 relative animate-in fade-in slide-in-from-top-2">
                      <div className="absolute left-[43px] top-5 w-2.5 h-2.5 rounded-full bg-[#7A9D8C] ring-4 ring-[#F4F7F5]" />
                      <InlineEventForm
                        onSave={(newEv) => {
                          updateTrip({ ...trip, events: [...(trip.events || []), newEv] });
                          setInsertIndex(null);
                          setInsertDefaultTime(null);
                          setInsertRouteContext(null);
                          setAiInitialData(null);
                        }}
                        onCancel={() => {
                          setInsertIndex(null);
                          setInsertDefaultTime(null);
                          setInsertRouteContext(null);
                          setAiInitialData(null);
                        }}
                        date={selectedDate}
                        trip={trip}
                        currentUser={currentUser}
                        initialData={aiInitialData || { time: insertDefaultTime }}
                        routeContext={insertRouteContext}
                        onOpenAiSuggest={() => setShowAiSuggestModal(true)}
                        onOpenAiChat={() => onOpenAiChat && onOpenAiChat()}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
          {showAddForm && !isReadOnly && (
            <div className="pl-[56px] relative animate-in fade-in slide-in-from-top-2">
              <div className="absolute left-[43px] top-5 w-2.5 h-2.5 rounded-full bg-[#7A9D8C] ring-4 ring-[#F4F7F5]" />
              <InlineEventForm
                onSave={(e) => {
                  updateTrip({ ...trip, events: [...(trip.events || []), e] });
                  setShowAddForm(false);
                  setAiInitialData(null);
                  setInsertRouteContext(null);
                }}
                onCancel={() => {
                  setShowAddForm(false);
                  setAiInitialData(null);
                  setInsertRouteContext(null);
                }}
                date={selectedDate}
                trip={trip}
                currentUser={currentUser}
                initialData={aiInitialData}
                routeContext={insertRouteContext}
                onOpenAiSuggest={() => setShowAiSuggestModal(true)}
                onOpenAiChat={() => onOpenAiChat && onOpenAiChat()}
              />
            </div>
          )}
        </div>
      </div>

      {!isReadOnly && !showAddForm && (
        <div className="mt-3.5 pl-[56px] space-y-2">
          {/* メイン：自分で予定を追加するボタン */}
          <button
            type="button"
            onClick={() => {
              setInsertIndex(null);
              const lastEvent = currentEvents[currentEvents.length - 1];
              const nextTime = lastEvent?.time ? getMidpointTime(lastEvent.time, null) : '12:00';
              setInsertRouteContext(
                lastEvent
                  ? {
                      time: nextTime,
                      prevTitle: lastEvent.title || '',
                      prevLocation: lastEvent.location || lastEvent.title || '',
                      prevTime: lastEvent.time || '',
                      nextTitle: '',
                      nextLocation: '',
                      nextTime: ''
                    }
                  : null
              );
              setAiInitialData({ time: nextTime });
              setShowAddForm(true);
            }}
            className="w-full py-3.5 bg-[#7A9D8C] hover:bg-[#688a79] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99]"
          >
            <Plus size={16} strokeWidth={2.5} /> 予定を追加する
          </button>

          {/* サブ：可愛い薄い水色のミニAI相談＆スポット候補ボタン */}
          <div className="flex items-center justify-end gap-1.5 pt-0.5">
            <span className="text-[10px] font-bold text-stone-400 mr-0.5">迷ったときは:</span>
            <button
              type="button"
              onClick={() => onOpenAiChat && onOpenAiChat()}
              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs active:scale-95"
            >
              <MessageCircle size={11} className="text-sky-500" /> AIに相談
            </button>
            <button
              type="button"
              onClick={() => {
                const lastEvent = currentEvents[currentEvents.length - 1];
                const nextTime = lastEvent?.time ? getMidpointTime(lastEvent.time, null) : '13:30';
                setInsertRouteContext(
                  lastEvent
                    ? {
                        time: nextTime,
                        prevTitle: lastEvent.title || '',
                        prevLocation: lastEvent.location || lastEvent.title || '',
                        prevTime: lastEvent.time || '',
                        nextTitle: '',
                        nextLocation: '',
                        nextTime: ''
                      }
                    : null
                );
                setShowAiSuggestModal(true);
              }}
              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs active:scale-95"
            >
              <Sparkles size={11} className="text-sky-500" /> スポット候補
            </button>
          </div>
        </div>
      )}

      {showAiSuggestModal && (
        <EventAiSuggestModal
          trip={trip}
          routeContext={insertRouteContext}
          onClose={() => setShowAiSuggestModal(false)}
          onSelect={(suggestedEvent) => {
            setAiInitialData(suggestedEvent);
            setShowAiSuggestModal(false);
            if (insertIndex === null) {
              setShowAddForm(true);
            }
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
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">この予定を削除しますか？</h3>
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 mb-4 text-left">
              {eventToDelete.time && (
                <p className="text-[10px] font-bold text-[#7A9D8C] flex items-center gap-1 mb-0.5">
                  <Clock size={11} /> {eventToDelete.time}
                </p>
              )}
              <p className="text-xs font-bold text-stone-800">{eventToDelete.title}</p>
              {eventToDelete.location && (
                <p className="text-[10px] text-stone-500 font-bold mt-1 flex items-center gap-1">
                  <MapPin size={10} className="text-red-500" /> {eventToDelete.location}
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
                    events: (trip.events || []).filter(e => e.id !== eventToDelete.id)
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
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">この写真を削除しますか？</h3>
            <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-3 border border-stone-200 shadow-xs bg-stone-100">
              <img src={photoToDelete.photo.url} alt="削除対象の写真" className="w-full h-full object-cover" />
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
                  handleDeleteEventPhoto(photoToDelete.eventId, photoToDelete.photo.id);
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
  useLockBodyScroll(true);
  const [step, setStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState(() => {
    // 初期状態で各予定の公開OKな写真があれば最大4枚までカバー候補にもセット可能にする
    const eventUrls = [];
    (trip.events || []).forEach(ev => {
      (ev.photos || []).forEach(p => {
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
    (trip.events || []).forEach(ev => {
      (ev.photos || []).forEach(p => {
        if (p.isPublic !== false && p.id) ids.push(p.id);
      });
    });
    return ids;
  });

  const fileInputRef = useRef(null);

  const eventsWithMemos = useMemo(
    () => (trip.events || []).filter(e => e.memo && e.memo.trim().length > 0),
    [trip.events]
  );

  const eventsWithPhotos = useMemo(
    () => (trip.events || []).filter(e => Array.isArray(e.photos) && e.photos.length > 0),
    [trip.events]
  );

  const toggleEventPhotoSelection = (photoId) => {
    setSelectedEventPhotoIds(prev =>
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };

  const handleImageUpload = async (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const compressedUrls = await Promise.all(files.map(file => compressImageFile(file, 1200, 0.82)));
      setSelectedImages([...selectedImages, ...compressedUrls.filter(Boolean)].slice(0, 4));
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
    const sanitizedEvents = (trip.events || []).map(({ photos, memo, ...eventRest }) => {
      const publicPhotos = Array.isArray(photos)
        ? photos
            .filter(p => selectedEventPhotoIds.includes(p.id))
            .map(p => ({ ...p, isPublic: true }))
        : [];
      return {
        ...eventRest,
        memo: shareMemos ? (memo || '') : '',
        status: 'approved',
        authorId: currentUser.id,
        photos: publicPhotos
      };
    });

    // 公開時の予算は予定内に記載されている金額の合計のみを記録する
    const totalEventsCost = sanitizedEvents.reduce((sum, ev) => sum + (Number(ev.cost) || 0), 0);

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
      members: [{ id: currentUser.id, name: currentUser.name, color: '#7A9D8C' }],
      events: sanitizedEvents,
      packingList: [],
      extraExpenses: [],
      souvenirList: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-6 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-base text-stone-800 flex items-center gap-2">
            <Globe size={18} className="text-[#7A9D8C]" />
            {step === 1 ? 'しおりを「みんなの旅」に公開' : '投稿内容の最終確認'}
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button>
        </div>

        {step === 1 ? (
          <div className="animate-in fade-in">
            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-500 mb-1.5">地域エリア</label>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${region === r ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]' : 'bg-white text-stone-600 border-stone-200'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-500 mb-1.5">旅の説明・おすすめポイント</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="3"
                placeholder="旅の感想やおすすめポイントなど..."
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none"
              />
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-stone-500">公開用のカバー写真を選択 (最大4枚)</label>
                <span className="text-xs font-bold text-[#7A9D8C]">{selectedImages.length}/4枚</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 shadow-sm group">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
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
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
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
                  {eventsWithPhotos.map(ev => (
                    <div key={ev.id} className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-2">
                      <p className="text-[11px] font-bold text-stone-700 truncate">
                        {ev.time} {ev.title}
                      </p>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                        {(ev.photos || []).map(p => {
                          const isSelected = selectedEventPhotoIds.includes(p.id);
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
                              <img src={p.url} alt="event" className="w-full h-full object-cover" />
                              <span
                                className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                                  isSelected ? 'bg-[#7A9D8C] text-white' : 'bg-black/50 text-white'
                                }`}
                              >
                                {isSelected ? <Check size={11} strokeWidth={3} /> : ''}
                              </span>
                              <span className={`absolute bottom-0 inset-x-0 text-[8px] font-bold py-0.5 text-center ${
                                isSelected ? 'bg-[#7A9D8C]/90 text-white' : 'bg-stone-800/75 text-stone-200'
                              }`}>
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
                    予約番号や個人情報が含まれる場合があるため、<strong>初期設定では「共有しない（非公開）」</strong>になっています。
                    {eventsWithMemos.length > 0 && `（現在 ${eventsWithMemos.length}件の予定にメモがあります）`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShareMemos(!shareMemos)}
                  className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 flex items-center ${shareMemos ? 'bg-[#7A9D8C] justify-end' : 'bg-stone-300 justify-start'}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-[11px] font-bold">
                <span className="text-stone-500">現在の設定：</span>
                {shareMemos ? (
                  <span className="text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">メモを公開する</span>
                ) : (
                  <span className="text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={11} strokeWidth={3} /> メモは共有しない（推奨・安全）
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
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-0.5">公開前の最終チェック</p>
                <p className="text-[11px] text-amber-800">以下の内容で「みんなの旅」に投稿されます。個人情報が含まれていないかご確認ください。</p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 block mb-0.5">タイトル / エリア</span>
                <p className="font-bold text-stone-800 text-sm">{trip.title} <span className="text-xs text-[#7A9D8C] ml-1">（{region}・{trip.destination}）</span></p>
              </div>

              {description && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block mb-0.5">旅の説明</span>
                  <p className="text-stone-700 font-medium whitespace-pre-wrap bg-white p-2.5 rounded-xl border border-stone-100">{description}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-stone-400 block mb-1">公開するカバー写真 ({selectedImages.length}枚)</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {selectedImages.map((url, i) => (
                    <img key={i} src={url} alt="cover" className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0" />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-600">公開される予定数</span>
                  <span className="font-bold text-stone-800">{(trip.events || []).length}件</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-600">各予定内の写真</span>
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
                  <span className="font-bold text-stone-600">持ち物リスト・出費メモ</span>
                  <span className="text-[11px] font-bold text-[#557465] bg-[#7A9D8C]/15 px-2.5 py-0.5 rounded-full">自動で非公開（除外）</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-600">各予定のメモ内容</span>
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
                  <p className="text-[10px] font-bold text-amber-700">▼ 公開されるメモの内容プレビュー</p>
                  {eventsWithMemos.map(ev => (
                    <div key={ev.id} className="text-[11px] border-b border-stone-100 pb-1 last:border-none last:pb-0">
                      <span className="font-bold text-stone-700">{ev.title}：</span>
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
function InlineEventForm({ onSave, onCancel, date, trip, currentUser, initialData, routeContext, onOpenAiSuggest, onOpenAiChat }) {
  const savedDepartures = useMemo(() => getSavedDeparturePoints(currentUser), [currentUser]);
  const [time, setTime] = useState(initialData?.time || routeContext?.time || '12:00');
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || 'sightseeing');
  const [departureOrigin, setDepartureOrigin] = useState(
    initialData?.departureOrigin || routeContext?.prevLocation || trip.departurePoint || savedDepartures[0] || ''
  );
  const [saveOriginForNext, setSaveOriginForNext] = useState(false);
  const [transportMethod, setTransportMethod] = useState(initialData?.transportMethod || trip.transportMethod || 'shinkansen_train');
  const [location, setLocation] = useState(initialData?.location || '');
  const [mapPinQuery, setMapPinQuery] = useState(initialData?.mapPinQuery || '');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapSearchInput, setMapSearchInput] = useState('');
  const [cost, setCost] = useState(initialData?.cost ? String(initialData.cost) : '');
  const [memo, setMemo] = useState(initialData?.memo || '');

  useEffect(() => {
    if (initialData) {
      if (initialData.time) setTime(initialData.time);
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.type) setType(initialData.type);
      if (initialData.departureOrigin !== undefined) setDepartureOrigin(initialData.departureOrigin);
      if (initialData.transportMethod !== undefined) setTransportMethod(initialData.transportMethod);
      if (initialData.location !== undefined) setLocation(initialData.location);
      if (initialData.mapPinQuery !== undefined) setMapPinQuery(initialData.mapPinQuery);
      if (initialData.cost !== undefined) setCost(String(initialData.cost));
      if (initialData.memo !== undefined) setMemo(initialData.memo);
    }
  }, [initialData]);

  // Googleマップの共有URLや座標・キーワードからピン用の検索クエリを抽出するヘルパー
  const extractPinQuery = (rawInput) => {
    const val = (rawInput || '').trim();
    if (!val) return '';
    // GoogleマップURL内の @lat,lng を検出
    const atCoordMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atCoordMatch) return `${atCoordMatch[1]},${atCoordMatch[2]}`;
    // ?q=xxx または /place/xxx を検出
    const placeMatch = val.match(/\/place\/([^/?]+)/);
    if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    const qMatch = val.match(/[?&](?:q|query)=([^&]+)/);
    if (qMatch) return decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
    return val;
  };

  const activePinTarget = extractPinQuery(mapPinQuery || location || title || trip.destination || '東京駅');

  const handleLockPin = () => {
    const target = extractPinQuery(mapSearchInput || location || title || trip.destination);
    if (!target) {
      customAlert('検索したい場所名や住所、またはGoogleマップの共有リンクを入力してください');
      return;
    }
    setMapPinQuery(target);
    if (!location.trim()) {
      setLocation(target);
    }
    customAlert(`📍「${target}」にGoogleマップのピンを固定しました！`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saveOriginForNext && departureOrigin.trim()) {
      addSavedDeparturePoint(departureOrigin.trim());
      customAlert(`📍「${departureOrigin.trim()}」を次の旅行でも使える出発地点に登録しました！`);
    }
    const selectedTag = QUICK_TAGS.find(t => t.id === type) || QUICK_TAGS[2];
    const finalTitle = title.trim() || selectedTag.defaultTitle;
    const finalLocation = location.trim() || mapPinQuery.trim();
    const finalPinQuery = extractPinQuery(mapPinQuery.trim() || finalLocation);
    onSave({
      id: generateId(),
      date,
      time: time || '12:00',
      title: finalTitle,
      type,
      departureOrigin: departureOrigin.trim(),
      transportMethod,
      location: finalLocation,
      mapPinQuery: finalPinQuery,
      cost: Number(cost) || 0,
      memo: memo.trim(),
      status: trip.isSoloTrip ? 'approved' : 'proposed',
      authorId: currentUser.id,
      photos: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-md border-2 border-[#7A9D8C] space-y-3 relative">
      {/* 最上段：左にタイトル、右上に独立したわかりやすい「× 閉じる」ボタン */}
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs font-extrabold text-[#557465] flex items-center gap-1">
          <Plus size={15} className="text-[#7A9D8C]" strokeWidth={2.8} /> 新しい予定を入力
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-200/80 hover:border-rose-200 text-[11px] font-extrabold flex items-center gap-1 transition-all active:scale-95 shrink-0 shadow-2xs"
          title="入力フォームを閉じる"
        >
          <X size={14} strokeWidth={2.6} />
          <span>閉じる</span>
        </button>
      </div>

      {/* 2段目：AIスポット提案・AI相談ボタン */}
      {(onOpenAiSuggest || onOpenAiChat) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {onOpenAiSuggest && (
            <button
              type="button"
              onClick={onOpenAiSuggest}
              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-colors active:scale-95"
            >
              <Sparkles size={11} className="text-sky-500" /> AIスポット提案
            </button>
          )}
          {onOpenAiChat && (
            <button
              type="button"
              onClick={onOpenAiChat}
              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors active:scale-95"
            >
              <MessageCircle size={11} className="text-sky-500" /> AI相談
            </button>
          )}
        </div>
      )}

      {routeContext && (routeContext.prevLocation || routeContext.nextLocation) && (
        <div className="px-3 py-2 bg-sky-50/70 border border-sky-200/70 rounded-xl text-[10px] font-bold text-sky-900 flex items-center justify-between gap-2">
          <div className="truncate">
            <span>📍 前後のルート: </span>
            {routeContext.prevLocation && <span>{routeContext.prevTime} {routeContext.prevLocation}</span>}
            {routeContext.nextLocation && <span> → {routeContext.nextTime} {routeContext.nextLocation}</span>}
          </div>
          {onOpenAiSuggest && (
            <button
              type="button"
              onClick={onOpenAiSuggest}
              className="shrink-0 text-[10px] font-extrabold text-sky-700 underline hover:text-sky-900"
            >
              周辺を提案
            </button>
          )}
        </div>
      )}

      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="flex gap-1.5 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden pb-0.5"
      >
        {QUICK_TAGS.map(tag => {
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
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">時間</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">予定のタイトル</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例: カフェでひと休み"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">場所・スポット名（目的地）</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="例: 嵐山カフェ"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-stone-400 block mb-0.5">1人あたり予算 (円)</label>
          <input
            type="number"
            value={cost}
            onChange={e => setCost(e.target.value)}
            placeholder="例: 1500"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
        </div>
      </div>

      {/* ★ 個別の予定ごとの出発地点＆移動手段（次回用に保存チェック付き） */}
      <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[10px] font-extrabold text-stone-600 flex items-center gap-1">
            <Navigation size={11} className="text-[#7A9D8C]" /> この予定の出発地点・移動方法（任意）
          </label>
          <label className="flex items-center gap-1 text-[9px] font-bold text-[#557465] cursor-pointer">
            <input
              type="checkbox"
              checked={saveOriginForNext}
              onChange={e => setSaveOriginForNext(e.target.checked)}
              className="rounded accent-[#7A9D8C]"
            />
            <span>次の旅行でも使えるよう保存</span>
          </label>
        </div>

        <input
          type="text"
          value={departureOrigin}
          onChange={e => setDepartureOrigin(e.target.value)}
          placeholder="出発地点（例: 松本駅 / 宿泊ホテル / 前の予定地）"
          className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
        />

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {savedDepartures.map(pt => (
            <button
              key={pt}
              type="button"
              onClick={() => setDepartureOrigin(pt)}
              className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all shrink-0 ${
                departureOrigin === pt
                  ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              📍 {pt}
            </button>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pt-0.5">
          {TRANSPORT_METHODS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setTransportMethod(m.id)}
              className={`whitespace-nowrap px-2 py-1 rounded-lg text-[10px] font-bold border transition-all shrink-0 ${
                transportMethod === m.id
                  ? 'bg-[#5E8473] text-white border-[#5E8473]'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📍 Googleマップのピン設定・プレビュー機能 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (!showMapPicker && !mapSearchInput) {
                setMapSearchInput(mapPinQuery || location || title || '');
              }
              setShowMapPicker(!showMapPicker);
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border flex items-center gap-1.5 transition-all active:scale-95 ${
              mapPinQuery
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                : showMapPicker
                ? 'bg-[#7A9D8C]/15 text-[#557465] border-[#7A9D8C]'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <MapPin size={13} className={mapPinQuery ? 'text-rose-500 fill-rose-500' : 'text-[#7A9D8C]'} />
            <span>
              {mapPinQuery ? `ピン固定済: ${mapPinQuery.slice(0, 14)}` : '🗺️ Googleマップでピンを指定・確認'}
            </span>
          </button>

          {(location.trim() || mapPinQuery.trim()) && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(extractPinQuery(mapPinQuery || location))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
            >
              <ExternalLink size={11} /> Googleマップアプリで開く
            </a>
          )}
        </div>

        {showMapPicker && (
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                <MapPin size={13} className="text-rose-500" /> Googleマップでピンを立てて保存
              </span>
              {mapPinQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMapPinQuery('');
                    customAlert('固定ピンを解除しました');
                  }}
                  className="text-[10px] font-bold text-stone-400 hover:text-rose-500 underline"
                >
                  ピン解除
                </button>
              )}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={mapSearchInput}
                onChange={e => setMapSearchInput(e.target.value)}
                placeholder="店名・住所・座標(35.01,135.76)・マップURLを貼付"
                className="flex-1 p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
              <button
                type="button"
                onClick={handleLockPin}
                className="px-3 py-2 bg-[#7A9D8C] hover:bg-[#688a79] text-white font-extrabold rounded-xl text-[11px] shrink-0 flex items-center gap-1 shadow-2xs active:scale-95"
              >
                <MapPin size={12} /> ピンを固定
              </button>
            </div>

            {/* 埋め込みGoogleマップ（赤いピン表示） */}
            <div className="w-full h-44 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative shadow-inner">
              <iframe
                title="Google Map Pin Preview"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  extractPinQuery(mapSearchInput || activePinTarget)
                )}&t=m&z=15&output=embed&iwloc=near`}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px] text-stone-500 leading-snug">
              <span>💡 Googleマップでピンを長押し→「共有」のリンクや座標を貼っても固定できます</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  extractPinQuery(mapSearchInput || activePinTarget)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-700 hover:bg-stone-100 flex items-center gap-0.5"
              >
                <ExternalLink size={10} /> 別タブで探す
              </a>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="text-[10px] font-bold text-stone-400 block mb-0.5">メモ（やりたいこと・持ち物など）</label>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          rows="2"
          placeholder="予約番号やメモを入力..."
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
          className="flex-[2] py-2.5 bg-[#7A9D8C] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#688a79] transition-colors flex items-center justify-center gap-1"
        >
          <Check size={14} /> 予定を追加
        </button>
      </div>
    </form>
  );
}

// タイムライン内の単体スポットAI提案モーダル（前後の時間・場所反映＆Googleマップ確認リンク付き）
function EventAiSuggestModal({ trip, routeContext, onClose, onSelect }) {
  useLockBodyScroll(true);
  const dest = trip.destination || '京都府';
  const targetTime = routeContext?.time || '13:30';
  const targetHour = Number((targetTime || '13:30').split(':')[0]) || 13;
  const defaultCat =
    targetHour >= 11 && targetHour <= 13
      ? 'ご当地ランチ'
      : targetHour >= 14 && targetHour <= 16
      ? 'カフェ・甘味処'
      : '絶景・写真スポット';

  const [category, setCategory] = useState(defaultCat);
  const [customAiSpots, setCustomAiSpots] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState(() => getAiQuotaStatus());
  const [showRewardAd, setShowRewardAd] = useState(false);
  const CATEGORIES = ['カフェ・甘味処', '絶景・写真スポット', 'ご当地ランチ', 'お土産・雑貨屋', '癒やし・足湯'];

  const routeAreaHint = routeContext?.prevLocation || routeContext?.nextLocation || dest;
  const routeNotePrefix =
    routeContext && (routeContext.prevLocation || routeContext.nextLocation)
      ? `【📍${routeContext.prevLocation || '出発地'}${routeContext.nextLocation ? ` → ${routeContext.nextLocation}` : ''} の移動ルート周辺・${targetTime}頃】`
      : '';

  // ジャンル切り替え時はまずキャッシュ（コスト0円）を表示
  useEffect(() => {
    const cacheKey = `spot_${dest}_${routeAreaHint}_${category}_${targetTime}`;
    const cached = getCachedAiResponse(cacheKey);
    setCustomAiSpots(cached || null);
  }, [dest, routeAreaHint, category, targetTime]);

  const handleGenerateByGemini = async () => {
    const cacheKey = `spot_${dest}_${routeAreaHint}_${category}_${targetTime}`;
    const cached = getCachedAiResponse(cacheKey);
    if (cached) {
      setCustomAiSpots(cached);
      customAlert('⚡ 保存済みキャッシュから高速表示しました（AI枠消費なし）');
      return;
    }

    const quotaCheck = consumeAiQuota();
    setQuotaStatus(quotaCheck.status);
    if (!quotaCheck.ok) {
      setShowRewardAd(true);
      return;
    }

    setIsAiLoading(true);
    try {
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            location: { type: "STRING" },
            type: { type: "STRING" },
            time: { type: "STRING" },
            cost: { type: "INTEGER" },
            memo: { type: "STRING" }
          },
          propertyOrdering: ["title", "location", "type", "time", "cost", "memo"]
        }
      };
      const aiSpots = await callGoogleGeminiStructured({
        systemPrompt: "あなたは日本の旅行ガイドAIです。実在する評価の高い店舗・観光スポットを3件、JSON配列で返してください。typeは meal, sightseeing, active のいずれかにしてください。",
        userPrompt: `エリア:${dest}（${routeAreaHint}周辺）、時間帯:${targetTime}頃、ジャンル:${category}。${routeNotePrefix}で立ち寄りやすい実在スポット3選を提案してください。`,
        responseSchema: schema
      });
      if (Array.isArray(aiSpots) && aiSpots.length > 0) {
        setCustomAiSpots(aiSpots);
        setCachedAiResponse(cacheKey, aiSpots);
        customAlert('✨ Google AIで最新スポット候補を生成しました！');
      }
    } catch (e) {
      customAlert('通信状況により定番キャッシュデータを表示しています');
    } finally {
      setIsAiLoading(false);
    }
  };

  const spotSuggestions = useMemo(() => {
    if (Array.isArray(customAiSpots) && customAiSpots.length > 0) return customAiSpots;
    const SPOT_BY_AREA = {
      '京都': {
        'カフェ・甘味処': [
          { title: '中村藤吉本店 宇治本店（生茶ゼリイ）', location: '中村藤吉本店', time: targetTime, cost: 1650, memo: `${routeNotePrefix}【★4.4 / レビュー4,200件超】安政元年創業の老舗茶商。竹筒に入った名物「生茶ゼリイ［抹茶］」は濃厚な抹茶の旨味と白玉が絶品。` },
          { title: 'ぎおん徳屋（本わらびもち）', location: 'ぎおん徳屋', time: targetTime, cost: 1500, memo: `${routeNotePrefix}【★4.4 / 食べログ百名店】注文ごとに練り上げるトロトロの本わらびもちが名物。花見小路近くで観光の合間に最適。` },
          { title: 'アラビカ京都 東山（% ARABICA）', location: 'アラビカ京都 東山', time: targetTime, cost: 700, memo: `${routeNotePrefix}【★4.3 / 八坂の塔すぐそば】世界的に人気のスペシャルティコーヒー専門店。濃厚なカフェラテ片手に東山散策が定番。` }
        ],
        '絶景・写真スポット': [
          { title: '伏見稲荷大社 千本鳥居', location: '伏見稲荷大社', time: targetTime, cost: 0, memo: `${routeNotePrefix}【★4.6 / 世界的人気の絶景】朱色の鳥居がどこまでも連なる幻想的な参道。四ツ辻まで登ると京都市街を一望できます。` },
          { title: '南禅寺 水路閣（レトロ赤レンガアーチ）', location: '南禅寺 水路閣', time: targetTime, cost: 0, memo: `${routeNotePrefix}【★4.5 / 明治の近代化遺産】境内に佇むローマ水道橋風のレンガアーチ。どこを切り取っても絵になるフォトスポット。` },
          { title: '法観寺 八坂の塔（東山通り）', location: '法観寺 八坂の塔', time: targetTime, cost: 0, memo: `${routeNotePrefix}【★4.4 / 京都らしい風情No.1】石畳の坂道の先に五重塔がそびえる定番アングル。夕暮れ時のマジックアワーが特に美しい。` }
        ],
        'ご当地ランチ': [
          { title: '南禅寺 順正（名物・京ゆどうふ）', location: '南禅寺 順正', time: targetTime, cost: 3500, memo: `${routeNotePrefix}【★4.3 / 登録有形文化財の庭園】美しい回遊式庭園を眺めながら、滑らかな京ゆどうふや田楽を味わえる老舗名店。` },
          { title: '山元麺蔵（手打ち京うどん・土ゴボウ天）', location: '山元麺蔵', time: targetTime, cost: 1600, memo: `${routeNotePrefix}【★4.5 / 京都屈指の行列店】力強いコシと喉越しの手打ちうどんに、香ばしい土ゴボウ天ぷらが相性抜群。` },
          { title: '先斗町 柚子元（名物・柚子鍋＆餃子）', location: '先斗町 柚子元', time: targetTime, cost: 2200, memo: `${routeNotePrefix}【★4.2 / 爽やかな柚子の香り】風情ある先斗町の人気店。香り高い柚子スープの麺類や名物餃子が口コミで評判。` }
        ],
        'お土産・雑貨屋': [
          { title: '錦市場商店街（京の台所食べ歩き＆お土産）', location: '錦市場', time: targetTime, cost: 2000, memo: `${routeNotePrefix}【★4.3 / 約400mのアーケード】京漬物、だし巻き卵、豆乳ドーナツなど京都の味覚と手土産が一度に揃う名所。` },
          { title: 'よーじや 祇園本店（あぶらとり紙・限定コスメ）', location: 'よーじや 祇園本店', time: targetTime, cost: 1500, memo: `${routeNotePrefix}【★4.2 / 京都土産の定番】定番のあぶらとり紙はもちろん、まゆごもりシリーズのハンドクリームや限定雑貨が人気。` }
        ],
        '癒やし・足湯': [
          { title: '嵐山駅 駅の足湯（天然温泉＆京友禅の光林）', location: '嵐山駅はんなり・ほっこりスクエア', time: targetTime, cost: 300, memo: `${routeNotePrefix}【★4.3 / オリジナルタオル付き】歩き疲れた足を嵐山温泉の足湯でリフレッシュ。駅構内の「キモノフォレスト」も必見。` },
          { title: '京都嵐山温泉 風風の湯（日帰り天然温泉）', location: '京都嵐山温泉 風風の湯', time: targetTime, cost: 1300, memo: `${routeNotePrefix}【★4.1 / 渡月橋すぐそば】露天風呂やサウナを備えた日帰り温泉施設。観光の締めくくりにさっぱり汗を流せます。` }
        ]
      }
    };

    const areaKey = Object.keys(SPOT_BY_AREA).find(k => dest.includes(k) || routeAreaHint.includes(k));
    if (areaKey && SPOT_BY_AREA[areaKey][category]) {
      return SPOT_BY_AREA[areaKey][category].map(item => ({
        ...item,
        type: category.includes('ランチ') || category.includes('カフェ') ? 'meal' : category.includes('癒やし') ? 'active' : 'sightseeing'
      }));
    }

    const cleanArea = (routeAreaHint || dest).replace(/[都道府県]$/, '') || '現地';
    return [
      {
        title: `${cleanArea}周辺 高評価${category}（★4.4人気店）`,
        location: `${cleanArea} ${category.split('・')[0]}`,
        type: category.includes('ランチ') || category.includes('カフェ') ? 'meal' : 'sightseeing',
        time: targetTime,
        cost: 1800,
        memo: `${routeNotePrefix}【★4.4 / 立ち寄りやすい名店】前後の予定の移動ルート上で無理なく立ち寄れる${cleanArea}エリアの人気${category}スポット。`
      },
      {
        title: `${cleanArea} 老舗・隠れ家${category.split('・')[0]}`,
        location: `${cleanArea} 老舗 ${category.split('・')[0]}`,
        type: category.includes('ランチ') || category.includes('カフェ') ? 'meal' : 'sightseeing',
        time: targetTime,
        cost: 1500,
        memo: `${routeNotePrefix}【★4.3 / 落ち着いた空間】${targetTime}頃の休憩・立ち寄りにぴったりな高評価スポット。`
      },
      {
        title: `${cleanArea} 定番の${category}名所`,
        location: `${cleanArea} 観光 ${category.split('・')[0]}`,
        type: category.includes('癒やし') ? 'active' : 'sightseeing',
        time: targetTime,
        cost: 2200,
        memo: `${routeNotePrefix}【★4.5 / 初めてならここ】写真映えする看板メニューや景色が揃う定番スポット。`
      }
    ];
  }, [dest, category, targetTime, routeAreaHint, routeNotePrefix, customAiSpots]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[250] flex justify-center items-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-base text-stone-800 flex items-center gap-1.5">
            <Sparkles size={18} className="text-sky-500" /> AIおすすめスポット提案 ({dest})
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20} /></button>
        </div>

        {/* API節約＆残り回数バー */}
        <div className="mb-3 px-3 py-2 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2 text-[10px] font-bold">
          <span className="text-emerald-700 flex items-center gap-1">
            ⚡ 初回表示は定番キャッシュ（AI枠消費0）
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-stone-600">本日残り <strong className="text-sky-700">{quotaStatus.remaining}/{quotaStatus.limit}回</strong></span>
            <button
              type="button"
              onClick={() => setShowRewardAd(true)}
              className="px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold"
            >
              🎬＋{REWARD_AD_BONUS_COUNT}
            </button>
          </div>
        </div>

        {routeContext && (routeContext.prevLocation || routeContext.nextLocation) && (
          <div className="mb-3 p-3 bg-sky-50 border border-sky-200/80 rounded-2xl text-[11px] font-bold text-sky-900 space-y-0.5">
            <p className="text-[10px] text-sky-600 font-extrabold">⏱️ 前後の予定・ルートを自動反映中（{targetTime}頃）</p>
            <p className="truncate">
              {routeContext.prevLocation ? `${routeContext.prevTime} ${routeContext.prevLocation}` : '出発'}
              {routeContext.nextLocation ? ` → ${routeContext.nextTime} ${routeContext.nextLocation}` : ''}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-xs text-stone-500">気になるジャンルを選ぶと予定へ反映できます。</p>
          <button
            type="button"
            disabled={isAiLoading}
            onClick={handleGenerateByGemini}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 text-[10px] font-extrabold flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles size={11} className="text-sky-600" />
            {isAiLoading ? 'Google AI生成中...' : 'Google AIで深掘り生成'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                category === c
                  ? 'bg-[#5E8473] text-white border-[#5E8473] shadow-2xs'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {spotSuggestions.map((spot, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-xs text-stone-800">{spot.title}</h4>
                  <p className="text-[10px] text-stone-500 font-bold mt-0.5 flex items-center gap-1">
                    <MapPin size={10} className="text-red-500" /> {spot.location} / 目安 ¥{spot.cost.toLocaleString()}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <ExternalLink size={11} /> マップで確認
                </a>
              </div>
              <p className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-100">{spot.memo}</p>
              <button
                type="button"
                onClick={() => onSelect(spot)}
                className="w-full py-2.5 bg-gradient-to-r from-sky-100 via-sky-200/80 to-cyan-100 hover:brightness-95 text-sky-900 border border-sky-300/80 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-[0.99]"
              >
                <Plus size={14} className="text-sky-600" /> この予定を追加フォームに反映
              </button>
            </div>
          ))}
        </div>

        {showRewardAd && (
          <RewardVideoAdModal
            onClose={() => setShowRewardAd(false)}
            onCompleteReward={(next) => setQuotaStatus(next)}
          />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// タイムラインの各予定カード (EventCard)
// ------------------------------------------
function EventCard({ event, trip, isReadOnly, currentUser, isClosestNow = false, isPassedEvent = false, betweenNowProgress = null, currentNowTimeStr = '', insertButtonSlot = null, onApprove, onUpdateEvent, onUpdateMemo, onDelete, onCopy, onAddPhoto, onTogglePhotoPublic, onRequestDeletePhoto, canDeletePhoto, onEnlargeImage }) {
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editTime, setEditTime] = useState(event.time || '12:00');
  const [editTitle, setEditTitle] = useState(event.title || '');
  const [editType, setEditType] = useState(event.type || 'sightseeing');
  const [editLocation, setEditLocation] = useState(event.location || '');
  const [editMapPinQuery, setEditMapPinQuery] = useState(event.mapPinQuery || '');
  const [showEditMapPicker, setShowEditMapPicker] = useState(false);
  const [editCost, setEditCost] = useState(event.cost ? String(event.cost) : '');
  const [editMemo, setEditMemo] = useState(event.memo || '');

  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoText, setMemoText] = useState(event.memo || '');
  const photoInputRef = useRef(null);

  useEffect(() => {
    setMemoText(event.memo || '');
    setEditTime(event.time || '12:00');
    setEditTitle(event.title || '');
    setEditType(event.type || 'sightseeing');
    setEditLocation(event.location || '');
    setEditMapPinQuery(event.mapPinQuery || '');
    setEditCost(event.cost ? String(event.cost) : '');
    setEditMemo(event.memo || '');
  }, [event]);

  const parsePinQuery = (rawInput) => {
    const val = (rawInput || '').trim();
    if (!val) return '';
    const atCoordMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atCoordMatch) return `${atCoordMatch[1]},${atCoordMatch[2]}`;
    const placeMatch = val.match(/\/place\/([^/?]+)/);
    if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    const qMatch = val.match(/[?&](?:q|query)=([^&]+)/);
    if (qMatch) return decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
    return val;
  };

  const handleSaveFullEventEdit = (e) => {
    e.preventDefault();
    const selectedTag = QUICK_TAGS.find(t => t.id === editType) || QUICK_TAGS[2];
    const finalTitle = editTitle.trim() || selectedTag.defaultTitle;
    const finalLocation = editLocation.trim() || editMapPinQuery.trim();
    const finalPinQuery = parsePinQuery(editMapPinQuery.trim() || finalLocation);
    if (onUpdateEvent) {
      onUpdateEvent({
        time: editTime || '12:00',
        title: finalTitle,
        type: editType,
        location: finalLocation,
        mapPinQuery: finalPinQuery,
        cost: Number(editCost) || 0,
        memo: editMemo.trim()
      });
    }
    setIsEditingEvent(false);
    setShowEditMapPicker(false);
    customAlert('予定の内容を更新しました！');
  };

  const tagInfo = QUICK_TAGS.find(t => t.id === event.type) || QUICK_TAGS[2];
  const TagIcon = tagInfo.icon;
  const author = (isReadOnly && !ENABLE_PUBLIC_SNS_FEATURES)
    ? { id: OFFICIAL_ACCOUNT_PROFILE.id, name: 'たびたび公式', color: '#7A9D8C', isOfficial: true }
    : ((trip.members || []).find(m => m.id === event.authorId) || { name: trip.authorName || currentUser?.name || 'メンバー', color: '#7A9D8C', avatar: trip.authorAvatar || currentUser?.avatar });
  const isProposed = event.status === 'proposed' && !trip.isSoloTrip && !isReadOnly;
  const memberCount = Math.max(1, (trip.members || []).length);

  // カテゴリごとの淡いパステル背景色とアイコン色（添付画像の雰囲気に合わせた配色）
  const tagStyleMap = {
    transport: 'bg-sky-50 text-sky-600 border-sky-100',
    meal: 'bg-orange-50 text-orange-500 border-orange-100',
    sightseeing: 'bg-emerald-50 text-[#557465] border-emerald-100',
    active: 'bg-purple-50 text-purple-600 border-purple-100',
    hotel: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };
  const iconBadgeStyle = tagStyleMap[event.type] || tagStyleMap.sightseeing;

  const handleSaveMemo = () => {
    if (onUpdateMemo) onUpdateMemo(memoText.trim());
    setIsEditingMemo(false);
    customAlert('メモを保存しました');
  };

  const resolvedMapDestination = parsePinQuery(event.mapPinQuery || event.location || event.title);

  const handleOpenNavigation = () => {
    const dest = encodeURIComponent(resolvedMapDestination);
    const originParam = event.departureOrigin
      ? `&origin=${encodeURIComponent(event.departureOrigin)}`
      : trip.departurePoint
      ? `&origin=${encodeURIComponent(trip.departurePoint.replace(/（.*?）/g, ''))}`
      : '';
    const travelMode =
      event.transportMethod === 'car'
        ? '&travelmode=driving'
        : event.transportMethod === 'shinkansen_train' || event.transportMethod === 'highway_bus'
        ? '&travelmode=transit'
        : '';
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}${originParam}${travelMode}`;
    window.open(navUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative flex items-stretch group">
      {/* ① 左側：時刻表示＋タイムライン軸＋Yahoo!乗換案内風のポワンポワン波紋ドット＋下部の省スペース「＋」ボタン */}
      <div className="w-[56px] shrink-0 flex flex-col justify-between select-none relative">
        {/* 通過済み〜現在進行中のライン色ハイライト */}
        {isPassedEvent && (
          <div
            className="absolute left-[47px] top-4 w-[2px] bg-sky-400/80 rounded-full pointer-events-none z-[5]"
            style={{
              height: betweenNowProgress !== null ? `${Math.round(betweenNowProgress * 100)}%` : '100%'
            }}
          />
        )}

        <div className="flex items-center pt-3">
          <div className="w-[40px] pr-1.5 text-right">
            <span
              className={`text-[12px] font-extrabold font-mono tracking-tight leading-none ${
                isClosestNow ? 'text-sky-600' : 'text-stone-700'
              }`}
            >
              {event.time || '--:--'}
            </span>
          </div>
          <div className="w-[16px] flex justify-center items-center relative z-10">
            {isClosestNow ? (
              /* ★ Yahoo!乗換案内風：現在時刻に一番近い点を2重の波紋でポワンポワンと脈動させる */
              <div className="relative flex items-center justify-center w-4 h-4">
                <span
                  className="absolute inline-flex w-6 h-6 rounded-full bg-sky-400/55 animate-ping"
                  style={{ animationDuration: '1.8s' }}
                />
                <span
                  className="absolute inline-flex w-4 h-4 rounded-full bg-sky-300/70 animate-pulse"
                  style={{ animationDuration: '1.4s' }}
                />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-sky-500 border-2 border-white shadow-[0_0_10px_rgba(14,165,233,0.85)]" />
              </div>
            ) : (
              <div
                className={`w-2.5 h-2.5 rounded-full ring-4 ring-[#F4F7F5] transition-transform group-hover:scale-125 ${
                  isProposed
                    ? 'bg-amber-400'
                    : isPassedEvent
                    ? 'bg-sky-400'
                    : 'bg-[#7A9D8C]'
                }`}
              />
            )}
          </div>
        </div>

        {/* 予定と予定の間の時間帯にいるとき、タイムラインの線上に現在時刻のポワンポワン位置を表示 */}
        {betweenNowProgress !== null && !isClosestNow && (
          <div
            className="absolute left-[40px] z-20 flex items-center pointer-events-none"
            style={{ top: `${Math.round(betweenNowProgress * 100)}%` }}
          >
            <div className="relative flex items-center justify-center w-4 h-4">
              <span
                className="absolute inline-flex w-5 h-5 rounded-full bg-sky-400/55 animate-ping"
                style={{ animationDuration: '1.8s' }}
              />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white shadow-sm" />
            </div>
          </div>
        )}

        {/* カードとカードの「ちょうど境界線（間）」に重なる位置へ追加ボタンを配置（上下の余白はゼロのまま） */}
        {insertButtonSlot && (
          <div className="absolute -bottom-[11px] left-[2px] z-30">
            {insertButtonSlot}
          </div>
        )}
      </div>

      {/* ③ 右側：スッキリ整理された予定カード本体 */}
      <div
        className={`flex-1 min-w-0 bg-white p-3 rounded-2xl shadow-xs border transition-all ${
          isEditingEvent
            ? 'border-2 border-[#7A9D8C] shadow-md'
            : isClosestNow
            ? 'border-sky-300 ring-2 ring-sky-100/80 shadow-sm'
            : isProposed
            ? 'border-amber-300 bg-amber-50/20'
            : 'border-stone-200/80 hover:border-stone-300'
        }`}
      >
        {isEditingEvent && !isReadOnly ? (
          <form onSubmit={handleSaveFullEventEdit} className="space-y-3 animate-in fade-in">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#7A9D8C] flex items-center gap-1">
                <Edit2 size={13} /> 予定の内容を編集
              </span>
              <button
                type="button"
                onClick={() => setIsEditingEvent(false)}
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-200/80 text-[11px] font-extrabold flex items-center gap-1"
              >
                <X size={13} /> 閉じる
              </button>
            </div>

            <div
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="flex gap-1.5 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden pb-0.5"
            >
              {QUICK_TAGS.map(tag => {
                const TIcon = tag.icon;
                const active = editType === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setEditType(tag.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 border transition-all ${
                      active
                        ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <TIcon size={12} /> {tag.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-0.5">時間</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-stone-400 block mb-0.5">タイトル</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="予定のタイトル"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-0.5">場所・店名</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  placeholder="例: 城崎温泉駅"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-0.5">1人あたり予算 (円)</label>
                <input
                  type="number"
                  value={editCost}
                  onChange={e => setEditCost(e.target.value)}
                  placeholder="0"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                />
              </div>
            </div>

            {/* 編集時のGoogleマップピン指定セクション */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowEditMapPicker(!showEditMapPicker)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border flex items-center gap-1.5 transition-all ${
                  editMapPinQuery
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <MapPin size={13} className={editMapPinQuery ? 'text-rose-500 fill-rose-500' : 'text-[#7A9D8C]'} />
                <span>{editMapPinQuery ? `ピン固定済: ${editMapPinQuery.slice(0, 14)}` : '🗺️ Googleマップでピンを指定'}</span>
              </button>

              {showEditMapPicker && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <input
                    type="text"
                    value={editMapPinQuery}
                    onChange={e => setEditMapPinQuery(e.target.value)}
                    placeholder="ピンを立てる住所・座標(35.01,135.76)・マップURL"
                    className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <iframe
                      title="Edit Map Pin Preview"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        parsePinQuery(editMapPinQuery || editLocation || editTitle || trip.destination || '東京駅')
                      )}&t=m&z=15&output=embed&iwloc=near`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 block mb-0.5">メモ</label>
              <textarea
                value={editMemo}
                onChange={e => setEditMemo(e.target.value)}
                rows="3"
                placeholder="メモを入力..."
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingEvent(false)}
                className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-[2] py-2.5 bg-[#7A9D8C] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#688a79] transition-colors flex items-center justify-center gap-1"
              >
                <Check size={14} /> 変更を保存する
              </button>
            </div>
          </form>
        ) : (
          <>
            {isClosestNow && (
              <div className="mb-2 flex items-center justify-between bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] font-extrabold text-sky-700 flex items-center gap-1">
                  <Clock size={11} className="text-sky-500" /> 現在時刻に一番近い予定
                </span>
                {event.date === getTodayString() && (
                  <span className="text-[9px] font-bold text-sky-600 bg-white px-2 py-0.2 rounded-full border border-sky-200/60">
                    今日
                  </span>
                )}
              </div>
            )}

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

            {/* メイン行：左に丸型カテゴリアイコン、中央にタイトル＆場所・金額、右に操作ボタン */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${iconBadgeStyle}`}>
                <TagIcon size={18} strokeWidth={2.2} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4
                    onClick={() => { if (!isReadOnly) setIsEditingEvent(true); }}
                    className={`font-extrabold text-sm text-stone-800 leading-snug ${!isReadOnly ? 'cursor-pointer hover:text-[#557465] transition-colors' : ''}`}
                    title={!isReadOnly ? 'タップしてタイトル・予定を編集' : undefined}
                  >
                    {event.title}
                  </h4>

                  {/* 右上アクション（コピー / 編集 / 削除 / 作成者アイコン） */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isReadOnly ? (
                      <button
                        type="button"
                        onClick={onCopy}
                        className="px-2 py-1 bg-[#7A9D8C]/10 hover:bg-[#7A9D8C]/20 text-[#557465] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="この予定をコピー"
                      >
                        <Copy size={11} /> コピー
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingEvent(true)}
                          className="text-stone-400 hover:text-[#7A9D8C] p-1 rounded-lg hover:bg-stone-50 transition-colors"
                          title="タイトル・時間・場所を編集"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={onDelete}
                          className="text-stone-300 hover:text-red-500 p-1 rounded-lg hover:bg-stone-50 transition-colors"
                          title="予定を削除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    <UserAvatar user={author} size="w-5 h-5" />
                  </div>
                </div>

                {/* サブメタ情報（出発地点・場所・ピン・予算チップ：1人あたり金額 × 参加人数） */}
                {(event.departureOrigin || event.location || event.mapPinQuery || Number(event.cost) > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {event.departureOrigin && (
                      <span className="text-[10px] font-bold text-[#557465] bg-[#7A9D8C]/12 px-2 py-0.5 rounded-full flex items-center gap-1 max-w-full truncate">
                        <Navigation size={10} className="text-[#7A9D8C] shrink-0" />
                        <span>{event.departureOrigin} 発</span>
                        {event.transportMethod && (
                          <span className="text-[9px] text-stone-500">
                            ({TRANSPORT_METHODS.find(m => m.id === event.transportMethod)?.short || '移動'})
                          </span>
                        )}
                      </span>
                    )}
                    {(event.location || event.mapPinQuery) && (
                      <span className="text-[11px] font-bold text-stone-500 flex items-center gap-0.5 truncate max-w-full">
                        <MapPin size={11} className={event.mapPinQuery ? 'text-rose-500 fill-rose-500 shrink-0' : 'text-stone-400 shrink-0'} />
                        {event.location || event.mapPinQuery}
                      </span>
                    )}
                    {event.mapPinQuery && (
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-full">
                        📍ピン保存済
                      </span>
                    )}
                    {Number(event.cost) > 0 && (
                      <span className="text-[10px] font-extrabold text-stone-700 bg-stone-100 border border-stone-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <span>¥{Number(event.cost).toLocaleString()}/人</span>
                        <span className="text-[#557465]">× {memberCount}人</span>
                        {memberCount > 1 && (
                          <span className="text-[9px] font-bold text-stone-400">
                            (計¥{(Number(event.cost) * memberCount).toLocaleString()})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ① 先に「マップで確認・ナビを起動」を配置（固定されたピンがあればそこへ直接ジャンプ） */}
            {(event.location || event.mapPinQuery || event.title) && (
              <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-2 gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resolvedMapDestination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border border-stone-200/70 transition-colors"
                >
                  <ExternalLink size={11} /> {event.mapPinQuery ? '保存ピンを確認' : 'マップで確認'}
                </a>
                <button
                  type="button"
                  onClick={handleOpenNavigation}
                  className="py-1.5 px-2.5 bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border border-blue-200/60 transition-colors"
                >
                  <Navigation size={11} /> ナビを起動
                </button>
              </div>
            )}

            {/* ② その下に「メモ」を配置（開いているか閉じているか一目で分かるUI） */}
            {(!isReadOnly || event.memo) && (
              <div className="mt-2.5">
                {isMemoOpen ? (
                  <div className="p-3 bg-[#7A9D8C]/10 rounded-xl border border-[#7A9D8C]/40 text-xs space-y-2 animate-in fade-in">
                    <div className="flex justify-between items-center border-b border-[#7A9D8C]/20 pb-1.5">
                      <span className="font-extrabold text-[#557465] flex items-center gap-1 text-[10px]">
                        <FileText size={12} /> メモ詳細（全文表示中）
                      </span>
                      <div className="flex items-center gap-2">
                        {!isReadOnly && !isEditingMemo && (
                          <button
                            type="button"
                            onClick={() => setIsEditingMemo(true)}
                            className="text-[10px] font-bold text-[#557465] hover:underline flex items-center gap-0.5"
                          >
                            <Edit2 size={10} /> 編集
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsMemoOpen(false);
                            setIsEditingMemo(false);
                          }}
                          className="text-[10px] font-extrabold text-stone-600 bg-white px-2 py-0.5 rounded-md border border-stone-200 hover:bg-stone-50"
                        >
                          閉じる ▲
                        </button>
                      </div>
                    </div>

                    {isEditingMemo && !isReadOnly ? (
                      <div className="space-y-2">
                        <textarea
                          value={memoText}
                          onChange={e => setMemoText(e.target.value)}
                          rows="3"
                          placeholder="予約番号やメモを入力..."
                          className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C] resize-none"
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
                      <p className="text-stone-700 font-medium whitespace-pre-wrap leading-relaxed">
                        {event.memo || 'メモはありません'}
                      </p>
                    )}
                  </div>
                ) : event.memo ? (
                  <button
                    type="button"
                    onClick={() => setIsMemoOpen(true)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100/90 border border-stone-200/80 text-left flex items-center justify-between gap-2 transition-colors group/memo"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <FileText size={12} className="text-[#7A9D8C] shrink-0" />
                      <span className="text-[11px] font-medium text-stone-600 truncate">
                        {event.memo}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold text-[#557465] bg-white border border-stone-200 px-2 py-0.5 rounded-md group-hover/memo:border-[#7A9D8C]">
                      全文を開く ▼
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMemoOpen(true);
                      setIsEditingMemo(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-500 border border-dashed border-stone-300 text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <FileText size={11} className="text-[#7A9D8C]" /> ＋ メモを追加する
                  </button>
                )}
              </div>
            )}

            {/* 予定ごとの思い出写真 */}
            {(!isReadOnly || (Array.isArray(event.photos) && event.photos.length > 0)) && (
              <div className="mt-2.5 pt-2.5 border-t border-stone-100">
                {Array.isArray(event.photos) && event.photos.length > 0 && (
                  <div
                    data-no-swipe="true"
                    style={{ touchAction: 'pan-x pan-y' }}
                    className="flex gap-2.5 overflow-x-auto no-scrollbar mb-2 pb-0.5"
                  >
                    {event.photos.map(p => {
                      const isMine = canDeletePhoto ? canDeletePhoto(p) : (!p.authorId || p.authorId === currentUser?.id);
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

                          {/* 自分のしおりの場合：左上に「🌐公開OK / 🔒非公開」の切り替えボタンを表示（SNS機能が有効な時のみ） */}
                          {!isReadOnly && ENABLE_PUBLIC_SNS_FEATURES && (
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
                      <Camera size={12} className="text-[#7A9D8C]" /> 思い出の写真を貼る
                    </button>
                    {ENABLE_PUBLIC_SNS_FEATURES && Array.isArray(event.photos) && event.photos.length > 0 && (
                      <span className="text-[9px] font-bold text-stone-400">
                        ※写真の「🌐公開可 / 🔒非公開」をタップで切替可能
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={photoInputRef}
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files?.[0] && onAddPhoto) {
                          const compressedUrl = await compressImageFile(e.target.files[0], 1200, 0.82);
                          onAddPhoto(compressedUrl);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// 思い出写真アルバム画面 (AlbumView)
// ------------------------------------------
function AlbumView({ trip, currentUser, updateTrip, isReadOnly, onEnlargeImage }) {
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

  const handleUpload = async (e) => {
    if (e.target.files && !isReadOnly) {
      const files = Array.from(e.target.files);
      const compressedList = await Promise.all(
        files.map(async (file) => ({
          id: generateId(),
          url: await compressImageFile(file, 1200, 0.82),
          authorId: currentUser?.id,
          authorName: currentUser?.name || 'メンバー',
          createdAt: getTodayString()
        }))
      );
      updateTrip({ ...trip, photos: [...compressedList, ...photos] });
      customAlert(`${compressedList.length}枚の写真を軽量化して共有アルバムに追加しました！`);
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
      photos: photos.filter(p => p.id !== photoId),
      events: (trip.events || []).map(ev => ({
        ...ev,
        photos: (ev.photos || []).filter(p => p.id !== photoId)
      }))
    });
    setPhotoToDelete(null);
    customAlert('思い出写真を削除しました');
  };

  return (
    <div className="p-5 pb-28 space-y-4 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-stone-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-stone-800 flex items-center gap-1.5">
            <ImageIcon size={16} className="text-[#7A9D8C]" /> 旅の思い出アルバム ({photos.length}枚)
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
            <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleUpload} />
          </>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200">
          <Camera size={32} className="text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-stone-500 mb-1">まだ思い出の写真がありません</p>
          <p className="text-[11px] text-stone-400">右上の「写真を追加」または各予定の「思い出の写真を貼る」から追加できます</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => {
            const isMine = isMyPhoto(photo);
            return (
              <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs group">
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
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-stone-800 mb-2">思い出の写真を削除しますか？</h3>
            <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-3 border border-stone-200 shadow-xs bg-stone-100">
              <img src={photoToDelete.url} alt="削除対象の写真" className="w-full h-full object-cover" />
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

// ------------------------------------------
// AIおまかせプラン作成モーダル (AiPlanSuggestModal)
// ------------------------------------------
function AiPlanSuggestModal({ currentUser, onClose, onSelectPlan }) {
  useLockBodyScroll(true);
  const savedDepartures = useMemo(() => getSavedDeparturePoints(currentUser), [currentUser]);
  const [mode, setMode] = useState('condition'); // 'condition' | 'chat'
  const [departurePoint, setDeparturePoint] = useState(savedDepartures[0] || '松本駅（自宅・最寄り駅）');
  const [saveOriginForNext, setSaveOriginForNext] = useState(false);
  const [destination, setDestination] = useState('京都府');
  const [transportMethod, setTransportMethod] = useState('shinkansen_train');
  const [transportPriority, setTransportPriority] = useState('cost'); // 'cost' | 'speed' | 'experience'
  const [budgetTier, setBudgetTier] = useState(BUDGET_TIER_OPTIONS[1].id);
  const [days, setDays] = useState(2);
  const [companion, setCompanion] = useState('カップル・夫婦（2名）');
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [theme, setTheme] = useState('王道＆ご当地グルメ');
  const [startDate, setStartDate] = useState(getTodayString());
  const [isSoloPlan, setIsSoloPlan] = useState(Boolean(currentUser?.isGuest));

  const [generatedPlans, setGeneratedPlans] = useState(null);
  const [planSourceType, setPlanSourceType] = useState('cache'); // 'cache' | 'gemini'
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState(() => getAiQuotaStatus());
  const [showRewardAdModal, setShowRewardAdModal] = useState(false);
  const [showPopularAreasInfo, setShowPopularAreasInfo] = useState(false);
  const [expandedPlanIdx, setExpandedPlanIdx] = useState(null);
  const [editingTitleIdx, setEditingTitleIdx] = useState(null);

  // チャット相談モード用ステート
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: 'こんにちは！AI旅コンシェルジュです✈️\n上の設定バーで「出発地・移動手段（コスパ/速さ/体験）・1人あたり予算」を選んで、下の候補ボタンまたは入力欄からご希望を教えてください！'
    }
  ]);

  const buildPlansForDestination = (destInput, numDays, compLabel, themeLabel, baseStartDate, adults = 2, children = 0, originInput = departurePoint, transMethod = transportMethod, transPrio = transportPriority, selectedBudgetTier = budgetTier) => {
    const cleanDest = (destInput || '京都府').trim();
    const cleanOrigin = (originInput || '自宅最寄り駅').replace(/（.*?）/g, '').trim() || '自宅最寄り駅';
    const methodObj = TRANSPORT_METHODS.find(m => m.id === transMethod) || TRANSPORT_METHODS[0];
    const prioObj = TRANSPORT_PRIORITIES.find(p => p.id === transPrio) || TRANSPORT_PRIORITIES[0];
    const budgetObj = BUDGET_TIER_OPTIONS.find(b => b.id === selectedBudgetTier) || BUDGET_TIER_OPTIONS[1];
    const isOkinawa = /沖縄|宮古|石垣|那覇/.test(cleanDest);
    const isHokkaido = /北海道|札幌|小樽|函館|富良野/.test(cleanDest);
    const isOnsen = /箱根|温泉|由布院|別府|草津|熱海|伊豆|城崎|道後/.test(cleanDest);

    const hasChildren = children > 0;
    const totalPeople = adults + children;
    const isLargeGroup = totalPeople >= 5;
    const compDetailLabel =
      compLabel === 'ひとり旅'
        ? 'ひとり旅'
        : compLabel === 'カップル・夫婦（2名）'
        ? 'カップル・夫婦（2名）'
        : `${compLabel}（大人${adults}名${children > 0 ? `・子ども${children}名` : ''}）`;

    const month = new Date(baseStartDate || getTodayString()).getMonth() + 1;
    const seasonWord = isOkinawa
      ? (month >= 6 && month <= 9 ? '美ら海マリン＆絶景' : '快適南国リゾート＆海カフェ')
      : isHokkaido
      ? (month >= 12 || month <= 2 ? '白銀の雪景色＆極上海鮮' : '爽快ドライブ＆北海道グルメ')
      : (month >= 3 && month <= 5 ? '春の絶景と旬グルメ' : month >= 6 && month <= 8 ? '夏の爽快旅とご当地グルメ' : month >= 9 && month <= 11 ? '秋の絶景と旬グルメ' : '冬の温泉と味覚満喫');

    const d1 = baseStartDate || getTodayString();
    const d2Obj = new Date(d1);
    d2Obj.setDate(d2Obj.getDate() + 1);
    const d2 = d2Obj.toISOString().split('T')[0];

    const endObj = new Date(d1);
    endObj.setDate(endObj.getDate() + Math.max(0, numDays - 1));
    const endDateStr = endObj.toISOString().split('T')[0];

    // 出発地＆移動手段＆重視スタイル（コスパ・速さ・体験）を反映した出発イベントを作成
    const transportCostEstimate =
      transPrio === 'cost' ? 4500 : transPrio === 'speed' ? 12000 : 8500;
    const departureMemo = `【📍出発: ${cleanOrigin} → ${cleanDest}｜${methodObj.label}（${prioObj.label}）】${prioObj.desc}。`;

    // 構成（子ども連れ / 大人数グループ / 少人数大人）に応じた補足メモ・宿提案の出し分け
    const groupSizeTip = isLargeGroup
      ? `【👥${totalPeople}名グループ向け】移動は事前予約制のジャンボタクシーやレンタカー2台体制、食事は個室・座敷の事前予約がスムーズです。`
      : hasChildren
      ? `【🧸お子様連れ配慮】ベビーカー移動やトイレ休憩に余裕を持たせた時間配分にしてあります。`
      : '';

    let spotSets;
    if (cleanDest.includes('京都')) {
      spotSets = hasChildren
        ? [
            [
              { date: d1, time: '10:00', title: '京都駅到着・手荷物配送（キャリーサービス）利用', type: 'transport', location: '京都駅', cost: 1000, memo: `お子様連れでも身軽に動けるよう駅地下から宿へ荷物を直送！${groupSizeTip}` },
              { date: d1, time: '11:00', title: '京都鉄道博物館（SLスチーム号乗車＆運転シミュレータ）', type: 'sightseeing', location: '京都鉄道博物館', cost: 1500, memo: '屋内展示が充実しており、天候を問わず大人も子どもも夢中になれる人気スポット！' },
              { date: d1, time: '13:30', title: '梅小路公園・京野菜レストラン梅小路コラボでランチ', type: 'meal', location: '京野菜レストラン梅小路コラボ', cost: 2200, memo: '広々とした店内でキッズメニューやソファ席もあり安心です。' },
              { date: d1, time: '15:00', title: '京都水族館（イルカパフォーマンス＆オオサンショウウオ見学）', type: 'active', location: '京都水族館', cost: 2400, memo: '梅小路公園内で徒歩すぐ！移動負担ゼロで1日楽しめます。' },
              { date: d1, time: '17:30', title: '梅小路ポテル京都 または 嵐山温泉 花伝抄 チェックイン', type: 'hotel', location: '梅小路ポテル京都', cost: 18500, memo: `【🍽️夕食提案：宿での夕食（ビュッフェ・会席）がおすすめ】大人${adults}名・子ども${children}名なら、移動いらずで子ども向け料理も揃うホテル夕食付きプランが快適です！` },
              { date: d2, time: '09:30', title: '嵐山・渡月橋さんぽ＆嵯峨野トロッコ列車乗車', type: 'active', location: 'トロッコ嵯峨駅', cost: 880, memo: '保津川渓谷の絶景を眺めながら走る観光列車はお子様にも大人気。' },
              { date: d2, time: '12:00', title: '嵐山よしむら（お座敷席も選べる手打ち蕎麦ランチ）', type: 'meal', location: '嵐山よしむら', cost: 2200, memo: '渡月橋を眺めながら家族みんなでゆったりランチ。' }
            ]
          ]
        : [
            [
              { date: d1, time: '10:00', title: '京都駅到着・手荷物配送サービス利用', type: 'transport', location: '京都駅', cost: 1000, memo: `駅地下のキャリーサービスで宿へ荷物を送ると手ぶらで観光できます。${groupSizeTip}` },
              { date: d1, time: '11:30', title: '南禅寺 順正（登録有形文化財の庭園で湯豆腐ランチ）', type: 'meal', location: '南禅寺 順正', cost: 3500, memo: '★4.3の人気老舗。食後はすぐ隣の水路閣へ。' },
              { date: d1, time: '14:00', title: '永観堂＆哲学の道さんぽ', type: 'sightseeing', location: '永観堂 禅林寺', cost: 1000, memo: '庭園と池の景色が美しい定番名所。' },
              { date: d1, time: '15:30', title: 'ぎおん徳屋（とろける本わらびもち休憩）', type: 'meal', location: 'ぎおん徳屋', cost: 1500, memo: '注文後に練り上げる極上わらびもち。' },
              { date: d1, time: '18:00', title: '先斗町・祇園エリアで京おばんざいディナー＆ホテル泊', type: 'hotel', location: '先斗町', cost: 16500, memo: `【🍽️夕食提案：外食がおすすめ】大人${adults}名のグループなら、ホテルは朝食付きにして先斗町や木屋町で京料理・地酒を外食するのが大正解！${isLargeGroup ? '（5名以上のため個室席の事前予約が必須です）' : ''}` },
              { date: d2, time: '09:30', title: '嵐山・竹林の小径＆渡月橋散策', type: 'sightseeing', location: '嵐山 竹林の小径', cost: 0, memo: '朝10時前なら人が少なく静かに撮影できます。' },
              { date: d2, time: '12:00', title: '嵐山よしむら（渡月橋を一望する手打ち蕎麦）', type: 'meal', location: '嵐山よしむら', cost: 2400, memo: '2階窓際席からの渡月橋ビューが人気。' }
            ],
            [
              { date: d1, time: '10:30', title: '伏見稲荷大社 千本鳥居参拝', type: 'sightseeing', location: '伏見稲荷大社', cost: 0, memo: '朱色の鳥居が連なる幻想的な参道。' },
              { date: d1, time: '12:30', title: '錦市場で京の台所食べ歩きランチ', type: 'meal', location: '錦市場', cost: 2200, memo: 'だし巻き卵や湯葉、豆乳ドーナツを堪能。' },
              { date: d1, time: '14:30', title: 'アラビカ京都 東山（% ARABICA）＆八坂の塔散策', type: 'meal', location: 'アラビカ京都 東山', cost: 800, memo: '濃厚ラテ片手に石畳の東山エリアを散策。' },
              { date: d1, time: '17:30', title: '京都嵐山温泉 花伝抄 チェックイン', type: 'hotel', location: '京都嵐山温泉 花伝抄', cost: 19000, memo: '【🍽️夕食提案：宿での夕食がおすすめ】嵐山エリアは夕方以降に閉まる店が多いため、宿の京会席と5つの貸切露天風呂を満喫するのがおすすめです。' },
              { date: d2, time: '10:30', title: '宇治・平等院鳳凰堂＆中村藤吉本店で生茶ゼリイ', type: 'sightseeing', location: '中村藤吉本店', cost: 2600, memo: '竹筒に入った濃厚抹茶ゼリイは必食！' },
              { date: d2, time: '13:30', title: '京都駅ビルで京土産ショッピング', type: 'sightseeing', location: '京都駅', cost: 3000, memo: '阿闍梨餅や抹茶スイーツをチェック。' }
            ]
          ];
    } else if (isOkinawa) {
      spotSets = [
        [
          { date: d1, time: '11:00', title: `那覇空港到着・${isLargeGroup ? 'ワゴン車レンタカー' : 'レンタカー'}出発＆首里そばランチ`, type: 'meal', location: '首里そば', cost: 1000, memo: `澄んだカツオ出汁とコシのある自家製麺の名店。${groupSizeTip}` },
          { date: d1, time: '13:30', title: '沖縄美ら海水族館＆備瀬のフクギ並木さんぽ', type: 'sightseeing', location: '沖縄美ら海水族館', cost: 2180, memo: hasChildren ? '黒潮の海大水槽のジンベエザメやイルカショー（オキちゃん劇場）は子どもたちも大喜び！' : '黒潮の海大水槽のジンベエザメは圧巻！' },
          { date: d1, time: '16:00', title: '古宇利大橋ドライブ＆KOURI SHRIMPでガーリックシュリンプ', type: 'meal', location: 'KOURI SHRIMP', cost: 1800, memo: 'エメラルドグリーンの海を渡る絶景ドライブ！' },
          { date: d1, time: '18:30', title: '恩納村リゾートホテル宿泊＆島唄ライブ居酒屋でアグー豚ディナー', type: 'hotel', location: '恩納村', cost: 19500, memo: hasChildren ? `【🍽️夕食提案：ホテル内のファミリー向けビュッフェ または 座敷のある沖縄料理店へ外食】大人${adults}名・子ども${children}名なら早めの18時台スタートが安心です。` : `【🍽️夕食提案：外食がおすすめ】恩納村〜那覇エリアは沖縄料理居酒屋やステーキ名店が充実しているため、外に食べに行くのがおすすめです！` },
          { date: d2, time: '10:00', title: hasChildren ? '体験王国むら咲むら（シーサー絵付け体験）＆瀬長島ウミカジテラス' : '万座毛・絶景断崖ビュー＆瀬長島ウミカジテラス', type: 'sightseeing', location: '瀬長島ウミカジテラス', cost: 2000, memo: '白いテラスカフェが並ぶ海辺のスポットでマンゴースイーツを堪能。' },
          { date: d2, time: '13:00', title: 'ジャッキーステーキハウスで名物テンダーロインステーキ', type: 'meal', location: 'ジャッキーステーキハウス', cost: 3200, memo: '沖縄の締めに欠かせない老舗ステーキハウス！' }
        ]
      ];
    } else if (isOnsen) {
      spotSets = [
        [
          { date: d1, time: '11:00', title: `${cleanDest}エリア到着・駅前食べ歩き＆名物ランチ`, type: 'meal', location: cleanDest, cost: 2000, memo: `まずは地元で人気の名物ランチと温泉まんじゅうを満喫。${groupSizeTip}` },
          { date: d1, time: '13:30', title: hasChildren ? `${cleanDest}の自然公園・ロープウェイ＆動物ふれあい体験` : `${cleanDest}の絶景スポット＆美術館・庭園めぐり`, type: 'sightseeing', location: cleanDest, cost: 1800, memo: hasChildren ? '乗り物や自然体験で子どもも飽きずに楽しめるコースです。' : '自然の景色とアートをゆっくり鑑賞。' },
          { date: d1, time: '16:00', title: `${cleanDest} ${hasChildren ? '和洋室・貸切風呂付き温泉宿' : '露天風呂付き温泉宿'} チェックイン`, type: 'hotel', location: cleanDest, cost: 22000, memo: `【🍽️夕食提案：宿での夕食（1泊2食付き）が断然おすすめ】${cleanDest}の温泉街は夜になると周辺の飲食店が早く閉まるため、${hasChildren ? 'お子様膳やビュッフェが選べる' : '宿自慢の'}1泊2食付きプランを予約しておくのが安心です！` },
          { date: d2, time: '10:30', title: '朝の温泉街さんぽ＆人気のベーカリーカフェでブランチ', type: 'meal', location: cleanDest, cost: 1800, memo: 'チェックアウト後は景色が良いテラスカフェでひと休み。' },
          { date: d2, time: '13:00', title: 'ご当地お土産ショッピング＆帰路へ', type: 'sightseeing', location: cleanDest, cost: 2500, memo: '名物の和菓子や地酒をお土産に。' }
        ]
      ];
    } else {
      spotSets = [
        [
          { date: d1, time: '10:30', title: `${cleanDest}到着・駅周辺の人気ご当地ランチ`, type: 'meal', location: `${cleanDest} 駅`, cost: 2000, memo: `口コミ評価の高い名店で地元の旬の味覚を堪能。${groupSizeTip}` },
          { date: d1, time: '13:00', title: hasChildren ? `${cleanDest}の体験ミュージアム・水族館・公園スポット` : `${cleanDest}の定番観光名所・歴史スポット散策`, type: 'sightseeing', location: cleanDest, cost: 1200, memo: hasChildren ? '大人も子どもも一緒に楽しめる体験型スポットを中心にセレクト。' : '初めて訪れるなら外せない王道の絶景・文化スポット。' },
          { date: d1, time: '15:30', title: `${cleanDest}の隠れ家カフェでご当地スイーツ休憩`, type: 'meal', location: cleanDest, cost: 1400, memo: '歩き疲れたら評判のカフェで一息。' },
          { date: d1, time: '18:00', title: `${cleanDest} 中心エリアのホテル宿泊＆地元名物ディナー`, type: 'hotel', location: cleanDest, cost: 16000, memo: hasChildren ? `【🍽️夕食提案：座敷・個室のある郷土料理店へ外食 または ホテル夕食】大人${adults}名・子ども${children}名でゆったり座れるお店を予約するのがおすすめ！` : `【🍽️夕食提案：ホテルは朝食のみにして外食がおすすめ】${cleanDest}の繁華街・駅周辺には地元食材を使った名店が集まっているため、夜は外に食べに行くのがおすすめです！` },
          { date: d2, time: '10:00', title: `${cleanDest}の朝市・マーケット＆体験アクティビティ`, type: 'active', location: cleanDest, cost: 2500, memo: '2日目の午前中はその土地ならではの体験や散策を満喫。' },
          { date: d2, time: '12:30', title: '人気ランチ＆お土産ショッピング', type: 'meal', location: cleanDest, cost: 2500, memo: '帰りの電車・フライト前にお土産を購入。' }
        ]
      ];
    }

    // 選択された日数（numDays）に合わせて日程イベントを組み立てるヘルパー
    const expandEventsForDays = (baseEvents, variantIdx = 0) => {
      if (numDays <= 1) {
        // 日帰り（1日）の場合は1日目の観光・グルメ・体験のみ（宿泊を除く）
        return baseEvents
          .filter(ev => ev.date === d1 && ev.type !== 'hotel')
          .map(ev => ({ ...ev }));
      }
      if (numDays === 2) {
        return baseEvents.map(ev => ({ ...ev }));
      }

      // 3日間以上の場合は、1日目＋中間日（Day 2 〜 Day N-1）＋最終日（Day N）に展開
      const day1Events = baseEvents.filter(ev => ev.date === d1).map(ev => ({ ...ev }));
      const finalDayTemplate = baseEvents.filter(ev => ev.date === d2);
      const extraDayTemplates = [
        [
          { time: '10:00', title: `${cleanDest} 周辺エリア・絶景スポットへ足を延ばす散策`, type: 'sightseeing', location: cleanDest, cost: 1500, memo: '連泊ならではのゆとりあるスケジュールで人気エリアを深掘り！' },
          { time: '12:30', title: `${cleanDest} 地元で評判の旬ランチ＆カフェ巡り`, type: 'meal', location: cleanDest, cost: 2200, memo: '口コミ高評価の名店でゆったりランチタイム。' },
          { time: '15:00', title: `${cleanDest} 体験アクティビティ・温泉・ミュージアム巡り`, type: 'active', location: cleanDest, cost: 2800, memo: 'その土地ならではの文化体験や自然アクティビティを満喫。' },
          { time: '18:30', title: `${cleanDest} ご当地ディナー＆宿泊`, type: 'hotel', location: cleanDest, cost: 16500, memo: '夜は地元食材を使った名物料理で乾杯！' }
        ],
        [
          { time: '09:30', title: `${cleanDest} 朝市・ローカルマーケット＆朝カフェ散歩`, type: 'meal', location: cleanDest, cost: 1400, memo: '早起きして地元の朝市やベーカリーへ。' },
          { time: '11:30', title: `${cleanDest} 穴場の景勝地・歴史エリアめぐり`, type: 'sightseeing', location: cleanDest, cost: 1200, memo: '定番とは一味違うフォトジェニックな名所を訪問。' },
          { time: '14:30', title: `${cleanDest} 老舗甘味処・ロースタリーカフェで休憩`, type: 'meal', location: cleanDest, cost: 1500, memo: '旅の合間にほっと一息つける人気カフェ。' },
          { time: '18:00', title: `${cleanDest} 宿でゆっくり温泉＆会席ディナー`, type: 'hotel', location: cleanDest, cost: 17500, memo: '連泊の中日は宿でゆっくり疲れを癒やすのもおすすめ。' }
        ]
      ];

      const result = [...day1Events];
      for (let dayIdx = 2; dayIdx < numDays; dayIdx++) {
        const dtObj = new Date(d1);
        dtObj.setDate(dtObj.getDate() + (dayIdx - 1));
        const dateStr = dtObj.toISOString().split('T')[0];
        const template = extraDayTemplates[(dayIdx + variantIdx) % extraDayTemplates.length];
        template.forEach(item => {
          result.push({
            ...item,
            date: dateStr,
            title: `【${dayIdx}日目】${item.title}`
          });
        });
      }

      // 最終日
      finalDayTemplate.forEach(item => {
        result.push({
          ...item,
          date: endDateStr
        });
      });

      return result;
    };

    const rawSet1WithOrigin = spotSets[0].map((ev, idx) =>
      idx === 0
        ? {
            ...ev,
            time: '09:00',
            title: `${cleanOrigin}から${methodObj.short}で${cleanDest}へ出発（${prioObj.label}）`,
            type: 'transport',
            departureOrigin: cleanOrigin,
            transportMethod: transMethod,
            cost: transportCostEstimate,
            memo: `${departureMemo} ${ev.memo || ''}`
          }
        : ev
    );
    const baseSet1 = expandEventsForDays(rawSet1WithOrigin, 0);
    const rawSet2 = (spotSets[1] || spotSets[0]).map((ev, i) => {
      if (i === 0) {
        return {
          ...ev,
          time: '09:00',
          title: `${cleanOrigin}発・${methodObj.short}で行く${cleanDest}（${prioObj.label}ルート）`,
          type: 'transport',
          departureOrigin: cleanOrigin,
          transportMethod: transMethod,
          cost: transportCostEstimate,
          memo: `${departureMemo} ${ev.memo || ''}`
        };
      }
      return {
        ...ev,
        time: i === 1 ? '12:00' : ev.time,
        title: i === 1 ? `${cleanDest}の隠れ家名店でこだわりランチ` : ev.title
      };
    });
    const baseSet2 = expandEventsForDays(rawSet2, 1);

    // 子どもがいる場合は1人あたりの平均予算目安（子ども料金考慮）を少し抑えて算出
    const childDiscountFactor = totalPeople > 0 ? (adults + children * 0.6) / totalPeople : 1;
    const calcPerPersonBudget = (evList, extra) =>
      Math.min(
        budgetObj.amount,
        Math.round((evList.reduce((s, e) => s + (Number(e.cost) || 0), 0) + extra) * childDiscountFactor)
      );

    return [
      {
        badge: `${methodObj.short}×${prioObj.label}`,
        title: `【${seasonWord}】${cleanOrigin}発・${methodObj.short}で行く${cleanDest}${numDays}日間の旅`,
        description: `📍${cleanOrigin}から${methodObj.label}（${prioObj.label}・予算目安:${budgetObj.label}）で向かう${compDetailLabel}向け最適プラン！実在する高評価の名店と夕食スタイル提案まで収録しています。`,
        departurePoint: cleanOrigin,
        destination: cleanDest,
        transportMethod: transMethod,
        transportPriority: transPrio,
        startDate: d1,
        endDate: endDateStr,
        budget: calcPerPersonBudget(baseSet1, 3000),
        isSoloPlan,
        events: baseSet1
      },
      {
        badge: hasChildren ? 'ファミリー向けゆったり' : `穴場・${prioObj.label}`,
        title: `【${hasChildren ? 'ゆったり' : '穴場'}】${cleanOrigin}発・${compDetailLabel}で楽しむ${cleanDest}厳選コース`,
        description: `${cleanOrigin}からの移動負担を抑え、${compDetailLabel}のペースでゆったり過ごせる実在の名店・ミュージアムを中心に組んだプラン。`,
        departurePoint: cleanOrigin,
        destination: cleanDest,
        transportMethod: transMethod,
        transportPriority: transPrio,
        startDate: d1,
        endDate: endDateStr,
        budget: calcPerPersonBudget(baseSet2, 3000),
        isSoloPlan,
        events: baseSet2
      },
      {
        badge: `体験・${themeLabel.slice(0, 8)}満喫`,
        title: `【体験】${cleanOrigin}発・${compDetailLabel}で盛り上がる${cleanDest}アクティビティ＆食べ歩き`,
        description: `移動も旅の思い出になる${prioObj.label}ルートと、${compDetailLabel}にぴったりの写真映えスポット・ご当地ディナーを詰め込んだ充実コース！`,
        departurePoint: cleanOrigin,
        destination: cleanDest,
        transportMethod: transMethod,
        transportPriority: transPrio,
        startDate: d1,
        endDate: endDateStr,
        budget: calcPerPersonBudget(baseSet1, 4500),
        isSoloPlan,
        events: baseSet1.map((ev, i) => i === 2 ? { ...ev, type: 'active', title: `${cleanDest} ご当地体験・クルーズ＆絶景散策` } : ev)
      }
    ];
  };

  // ★ 鉄則①＆②：定番エリアの初回プランや過去キャッシュがある場合はAPIを叩かず0秒・0円で返し、カスタム条件や「AIで別プラン再生成」のときだけGemini APIを呼ぶ
  const handleGenerate = async (forceGeminiApi = false) => {
    if (saveOriginForNext && departurePoint.trim()) {
      addSavedDeparturePoint(departurePoint.trim());
    }
    const cleanDest = (destination || '京都府').trim();
    const cleanOrigin = (departurePoint || '自宅最寄り駅').trim();
    const methodObj = TRANSPORT_METHODS.find(m => m.id === transportMethod) || TRANSPORT_METHODS[0];
    const prioObj = TRANSPORT_PRIORITIES.find(p => p.id === transportPriority) || TRANSPORT_PRIORITIES[0];
    const cacheKey = `plan_${cleanOrigin}_${cleanDest}_${transportMethod}_${transportPriority}_${budgetTier}_${days}_${companion}_${adultCount}_${childCount}_${theme}`;
    const isPopularPresetArea = POPULAR_CACHED_AREAS.some(area => cleanDest.includes(area)) && days <= 4;

    if (!forceGeminiApi) {
      const savedCache = getCachedAiResponse(cacheKey);
      if (savedCache && Array.isArray(savedCache) && savedCache.length > 0) {
        setGeneratedPlans(savedCache);
        setPlanSourceType('cache');
        setExpandedPlanIdx(null);
        setEditingTitleIdx(null);
        return;
      }
      if (isPopularPresetArea) {
        const presetPlans = buildPlansForDestination(cleanDest, days, companion, theme, startDate, adultCount, childCount, cleanOrigin, transportMethod, transportPriority, budgetTier);
        setCachedAiResponse(cacheKey, presetPlans);
        setGeneratedPlans(presetPlans);
        setPlanSourceType('cache');
        setExpandedPlanIdx(null);
        setEditingTitleIdx(null);
        return;
      }
    }

    // ここから先は Google Gemini API を実際に呼び出すため、1日5回（＋広告ボーナス）のレート制限をチェック
    const quotaCheck = consumeAiQuota();
    setQuotaStatus(quotaCheck.status);
    if (!quotaCheck.ok) {
      setShowRewardAdModal(true);
      return;
    }

    setIsAiGenerating(true);
    try {
      const d1 = startDate || getTodayString();
      const endObj = new Date(d1);
      endObj.setDate(endObj.getDate() + Math.max(0, days - 1));
      const endDateStr = endObj.toISOString().split('T')[0];

      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            badge: { type: "STRING" },
            title: { type: "STRING" },
            description: { type: "STRING" },
            budget: { type: "INTEGER" },
            events: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  dayIndex: { type: "INTEGER" },
                  time: { type: "STRING" },
                  title: { type: "STRING" },
                  type: { type: "STRING" },
                  location: { type: "STRING" },
                  cost: { type: "INTEGER" },
                  memo: { type: "STRING" }
                },
                propertyOrdering: ["dayIndex", "time", "title", "type", "location", "cost", "memo"]
              }
            }
          },
          propertyOrdering: ["badge", "title", "description", "budget", "events"]
        }
      };

      const aiResult = await callGoogleGeminiStructured({
        systemPrompt: "あなたは日本の旅行プランナーAIです。出発地点から目的地までの指定された移動手段と重視ポイント（コスパ重視・速さ重視・体験重視）を1日目の最初の移動予定に具体的に組み込み、実在する高評価の観光地・飲食店・宿を使った旅行プランを2パターン、JSON配列で返してください。eventsのtypeは transport, meal, sightseeing, active, hotel のいずれか、dayIndexは1始まりの何日目かを指定してください。",
        userPrompt: `出発地点:${cleanOrigin}、目的地:${cleanDest}、移動手段:${methodObj.label}、移動の重視ポイント:${prioObj.label}（${prioObj.desc}）、1人あたり予算目安:${budgetTier}、日数:${days}日間、同行者:${companion}（大人${adultCount}名・子ども${childCount}名）、テーマ:${theme}。具体的な実在店名とおすすめ理由をmemoに入れて提案してください。`,
        responseSchema: schema
      });

      if (Array.isArray(aiResult) && aiResult.length > 0) {
        const formattedPlans = aiResult.map(p => ({
          badge: p.badge || `✨ ${methodObj.short}×${prioObj.label}`,
          title: p.title || `${cleanOrigin}発・${cleanDest} ${days}日間の旅`,
          description: p.description || '',
          departurePoint: cleanOrigin,
          destination: cleanDest,
          transportMethod,
          transportPriority,
          startDate: d1,
          endDate: endDateStr,
          budget: Number(p.budget) || 35000,
          isSoloPlan,
          events: (p.events || []).map((ev, idx) => {
            const evDateObj = new Date(d1);
            evDateObj.setDate(evDateObj.getDate() + Math.max(0, (Number(ev.dayIndex) || 1) - 1));
            return {
              date: evDateObj.toISOString().split('T')[0],
              time: ev.time || '12:00',
              title: ev.title || '観光スポット',
              type: ['transport', 'meal', 'sightseeing', 'active', 'hotel'].includes(ev.type) ? ev.type : 'sightseeing',
              departureOrigin: idx === 0 ? cleanOrigin : '',
              transportMethod: idx === 0 ? transportMethod : '',
              location: ev.location || cleanDest,
              cost: Number(ev.cost) || 1500,
              memo: ev.memo || ''
            };
          })
        }));
        setCachedAiResponse(cacheKey, formattedPlans);
        setGeneratedPlans(formattedPlans);
        setPlanSourceType('gemini');
        setExpandedPlanIdx(null);
        setEditingTitleIdx(null);
        return;
      }
      throw new Error('Fallback to preset');
    } catch (err) {
      const fallbackPlans = buildPlansForDestination(cleanDest, days, companion, theme, startDate, adultCount, childCount, cleanOrigin, transportMethod, transportPriority, budgetTier);
      setGeneratedPlans(fallbackPlans);
      setPlanSourceType('cache');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const CHAT_QUICK_SUGGESTIONS = [
    '♨️ 温泉と海鮮が美味しい1泊2日',
    '🧸 子ども連れで楽しめる家族旅行',
    '🍜 車なしで巡るご当地グルメ旅',
    '📸 カフェ＆絶景スポット巡り',
    '🌴 南国リゾートでゆったり休日'
  ];

  const handleSendChat = async (e, presetText) => {
    if (e) e.preventDefault();
    const q = (presetText || chatInput).trim();
    if (!q || isAiGenerating) return;
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    if (!presetText) setChatInput('');

    // まず同じ質問のキャッシュがあるか確認（キャッシュヒットならAPI消費0）
    const chatCacheKey = `chat_${q}_${days}_${startDate}_${adultCount}_${childCount}`;
    const cachedChat = getCachedAiResponse(chatCacheKey);
    if (cachedChat) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: `${cachedChat.text}\n（※保存済みキャッシュから高速表示・本日のAI無料枠は消費していません⚡）`,
          plan: { ...cachedChat.plan, isSoloPlan }
        }
      ]);
      return;
    }

    // 自由入力チャットのときは1日5回のレートリミットを消費してGoogle Gemini APIを呼ぶ
    const quotaCheck = consumeAiQuota();
    setQuotaStatus(quotaCheck.status);
    if (!quotaCheck.ok) {
      setShowRewardAdModal(true);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: `本日のAI無料生成枠（${quotaCheck.status.limit}回）を使い切りました🙏\n上の「🎬 動画広告を見て＋${REWARD_AD_BONUS_COUNT}回増やす」ボタンを押すと、すぐに続きをご相談いただけます！`
        }
      ]);
      return;
    }

    setIsAiGenerating(true);
    const matchedPref = PREFECTURES.find(p => q.includes(p.replace(/[都道府県]$/, ''))) ||
      (q.includes('箱根') || q.includes('温泉') ? '神奈川県・箱根' : q.includes('沖縄') || q.includes('南国') ? '沖縄県' : q.includes('札幌') || q.includes('小樽') ? '北海道' : q.includes('金沢') ? '石川県' : q.includes('カフェ') ? '長野県・軽井沢' : destination);
    const dayMatch = q.match(/(\d+)\s*泊\s*(\d+)\s*日/) || q.match(/(\d+)\s*日間?/);
    const parsedDays = dayMatch
      ? Math.min(10, Math.max(1, Number(dayMatch[2] || dayMatch[1])))
      : q.includes('日帰り')
      ? 1
      : q.includes('1週間') || q.includes('一週間')
      ? 7
      : days;
    const childMatch = q.match(/子ども\s*(\d+)|子供\s*(\d+)|子連れ|家族/);
    const parsedChildren = childMatch ? Number(childMatch[1] || childMatch[2] || 1) : childCount;
    const parsedCompanion = parsedChildren > 0 ? '家族・子連れ' : companion;

    const d1 = startDate || getTodayString();
    const endObj = new Date(d1);
    endObj.setDate(endObj.getDate() + Math.max(0, parsedDays - 1));
    const endDateStr = endObj.toISOString().split('T')[0];

    try {
      const schema = {
        type: "OBJECT",
        properties: {
          replyMessage: { type: "STRING" },
          destination: { type: "STRING" },
          title: { type: "STRING" },
          budget: { type: "INTEGER" },
          events: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                dayIndex: { type: "INTEGER" },
                time: { type: "STRING" },
                title: { type: "STRING" },
                type: { type: "STRING" },
                location: { type: "STRING" },
                cost: { type: "INTEGER" },
                memo: { type: "STRING" }
              },
              propertyOrdering: ["dayIndex", "time", "title", "type", "location", "cost", "memo"]
            }
          }
        },
        propertyOrdering: ["replyMessage", "destination", "title", "budget", "events"]
      };

      const aiData = await callGoogleGeminiStructured({
        systemPrompt: "あなたは親しみやすい日本の旅行コンシェルジュAIです。出発地点・移動手段・重視ポイント（コスパ/速さ/体験）・1人あたり予算を踏まえ、実在する名店・観光地を使った旅行プラン1件と丁寧な返答メッセージ(replyMessage)をJSONで返してください。",
        userPrompt: `ユーザーの要望:「${q}」 / 出発地点:${departurePoint} / 移動手段:${TRANSPORT_METHODS.find(m => m.id === transportMethod)?.label}（${TRANSPORT_PRIORITIES.find(p => p.id === transportPriority)?.label}） / 1人予算目安:${budgetTier} / 出発日:${d1} / 日数目安:${parsedDays}日間 / 同行者:大人${adultCount}名・子ども${parsedChildren}名`,
        responseSchema: schema
      });

      if (aiData && Array.isArray(aiData.events) && aiData.events.length > 0) {
        const builtPlan = {
          badge: '✨ Google AI チャット提案',
          title: aiData.title || `【AI提案】${aiData.destination || matchedPref}の旅`,
          description: aiData.replyMessage || '',
          destination: aiData.destination || matchedPref,
          startDate: d1,
          endDate: endDateStr,
          budget: Number(aiData.budget) || 32000,
          isSoloPlan,
          events: aiData.events.map(ev => {
            const evDateObj = new Date(d1);
            evDateObj.setDate(evDateObj.getDate() + Math.max(0, (Number(ev.dayIndex) || 1) - 1));
            return {
              date: evDateObj.toISOString().split('T')[0],
              time: ev.time || '12:00',
              title: ev.title,
              type: ['transport', 'meal', 'sightseeing', 'active', 'hotel'].includes(ev.type) ? ev.type : 'sightseeing',
              location: ev.location || aiData.destination || matchedPref,
              cost: Number(ev.cost) || 1500,
              memo: ev.memo || ''
            };
          })
        };
        const replyText = aiData.replyMessage || `ご希望に合わせて「${builtPlan.destination}」のプランを作成しました！`;
        setCachedAiResponse(chatCacheKey, { text: replyText, plan: builtPlan });
        setChatMessages(prev => [...prev, { role: 'ai', text: replyText, plan: builtPlan }]);
        setIsAiGenerating(false);
        return;
      }
      throw new Error('Empty events');
    } catch (err) {
      const suggestedList = buildPlansForDestination(matchedPref, parsedDays, parsedCompanion, theme, startDate, adultCount, parsedChildren, departurePoint, transportMethod, transportPriority, budgetTier);
      const topPlan = suggestedList[0];
      const fallbackText = `ご希望に合わせて「${matchedPref}」の具体的な実在スポット＆夕食スタイル提案入りのプランを作成しました！下のボタンからそのまましおりに反映できます✨`;
      setCachedAiResponse(chatCacheKey, { text: fallbackText, plan: topPlan });
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: fallbackText,
          plan: topPlan
        }
      ]);
      setIsAiGenerating(false);
    }
  };

  const handleUpdatePlanTitle = (pIdx, nextTitle) => {
    setGeneratedPlans(prev =>
      prev.map((p, idx) => (idx === pIdx ? { ...p, title: nextTitle } : p))
    );
  };

  const handleUpdatePlanEvent = (pIdx, eIdx, field, val) => {
    setGeneratedPlans(prev =>
      prev.map((p, idx) => {
        if (idx !== pIdx) return p;
        const nextEvents = p.events.map((ev, j) => (j === eIdx ? { ...ev, [field]: val } : ev));
        return { ...p, events: nextEvents };
      })
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[240] flex justify-center items-center p-4 animate-in fade-in" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl h-[84vh] max-h-[88vh] flex flex-col animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 shrink-0">
          <h3 className="font-extrabold text-base text-stone-800 flex items-center gap-1.5">
            <Sparkles size={18} className="text-[#5E8473]" /> AIおまかせプラン作成
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* ★ 1日のAI利用回数制限（レートリミット）＆動画広告で＋3回回復バー */}
        <div className="mb-2.5 px-3 py-2 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => setShowPopularAreasInfo(prev => !prev)}
              className="text-[10px] font-extrabold pl-2 pr-1.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300/70 shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="対象となる定番エリア一覧を見る"
            >
              <span>⚡ 定番エリアは枠消費0</span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-serif italic font-black leading-none shadow-2xs">
                i
              </span>
            </button>
            <span className="text-[11px] font-bold text-stone-600 truncate">
              本日のAI生成枠: <strong className={quotaStatus.remaining === 0 ? 'text-red-500' : 'text-[#557465]'}>残り{quotaStatus.remaining}/{quotaStatus.limit}回</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowRewardAdModal(true)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 text-[10px] font-extrabold flex items-center gap-1 transition-colors active:scale-95"
          >
            🎬 広告で＋{REWARD_AD_BONUS_COUNT}回
          </button>
        </div>

        {/* ★ iボタンをタップしたときに開く「枠消費0の定番エリア一覧」ポップオーバー（タップでそのまま目的地に入力可能） */}
        {showPopularAreasInfo && (
          <div className="mb-3 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs space-y-2.5 shrink-0 animate-in fade-in slide-in-from-top-1 max-h-56 overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Info size={14} className="text-emerald-600 shrink-0" />
                  AI無料枠を消費しない「定番エリア」一覧
                </p>
                <p className="text-[10px] font-bold text-emerald-700 mt-0.5 leading-relaxed">
                  以下のエリア（4日間以内）の初回プラン提案は、厳選キャッシュから<strong>0秒・枠消費0回</strong>で作成できます！（タップで目的地にセットできます）
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPopularAreasInfo(false)}
                className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-full shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {POPULAR_AREAS_GUIDE.map(group => (
                <div key={group.region} className="bg-white/90 p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-extrabold text-emerald-800 block mb-1">
                    🗾 {group.region}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.areas.map(areaName => {
                      const cleanName = areaName.split('（')[0];
                      const isCurrent = destination.includes(cleanName);
                      return (
                        <button
                          key={areaName}
                          type="button"
                          onClick={() => {
                            setDestination(areaName);
                            setMode('condition');
                            setGeneratedPlans(null);
                            setShowPopularAreasInfo(false);
                            customAlert(`目的地に「${areaName}」をセットしました！（枠消費0対象）`);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                            isCurrent
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-stone-50 hover:bg-emerald-100/70 text-stone-700 border-stone-200'
                          }`}
                        >
                          {areaName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* タブ切り替え：条件を選んで作成 / AIコンシェルジュに相談 */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setMode('condition')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'condition' ? 'bg-white text-[#4A6B5D] shadow-2xs' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <FileText size={13} className={`pointer-events-none ${mode === 'condition' ? 'text-[#5E8473]' : ''}`} />
            <span className="pointer-events-none">条件を選んで作成</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'chat' ? 'bg-white text-[#4A6B5D] shadow-2xs' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <MessageCircle size={13} className={`pointer-events-none ${mode === 'chat' ? 'text-[#5E8473]' : ''}`} />
            <span className="pointer-events-none">AIコンシェルジュに相談</span>
          </button>
        </div>

        {mode === 'condition' ? (
          !generatedPlans ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5 space-y-4 pb-3">
                {/* ★ 出発地点の選択（自宅の最寄り駅＋保存済み地点＋新規登録チェック） */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                      <Navigation size={12} className="text-[#7A9D8C]" /> 出発地点（基本: 自宅の最寄り駅）
                    </label>
                    <label className="flex items-center gap-1 text-[9px] font-bold text-[#557465] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveOriginForNext}
                        onChange={e => setSaveOriginForNext(e.target.checked)}
                        className="rounded accent-[#7A9D8C]"
                      />
                      <span>次の旅行でも使う</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={departurePoint}
                    onChange={e => setDeparturePoint(e.target.value)}
                    placeholder="例: 松本駅 / 東京駅 / 羽田空港"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {savedDepartures.map(pt => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setDeparturePoint(pt)}
                        className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all shrink-0 ${
                          departurePoint === pt
                            ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        📍 {pt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">行きたいエリア・都道府県</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="例: 京都府、沖縄県、箱根温泉、北海道"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>

                {/* ★ 目的地までの移動手段＆重視スタイル（コスパ重視 / 速さ重視 / 体験重視） */}
                <div className="p-3 bg-sky-50/60 border border-sky-200/80 rounded-2xl space-y-2.5">
                  <label className="text-[11px] font-extrabold text-sky-900 block">
                    🚆 目的地まで何で移動する？（移動手段＆重視ポイント）
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TRANSPORT_METHODS.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTransportMethod(m.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          transportMethod === m.id
                            ? 'bg-[#7A9D8C] text-white border-[#7A9D8C] shadow-2xs'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {TRANSPORT_PRIORITIES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTransportPriority(p.id)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          transportPriority === p.id
                            ? 'bg-sky-700 text-white border-sky-700 shadow-2xs'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold block">{p.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-sky-800 leading-snug">
                    💡 {TRANSPORT_PRIORITIES.find(p => p.id === transportPriority)?.desc}
                  </p>
                </div>

                {/* ★ 1人あたりの予算タブ */}
                <div>
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">1人あたりの予算目安</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BUDGET_TIER_OPTIONS.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBudgetTier(b.id)}
                        className={`py-2 px-3 rounded-xl text-[11px] font-extrabold border transition-all ${
                          budgetTier === b.id
                            ? 'bg-[#5E8473] text-white border-[#5E8473] shadow-2xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">出発日</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">日数</label>
                    <select
                      value={days}
                      onChange={e => setDays(Number(e.target.value))}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                    >
                      <option value={1}>日帰り（1日）</option>
                      <option value={2}>1泊2日（2日間）</option>
                      <option value={3}>2泊3日（3日間）</option>
                      <option value={4}>3泊4日（4日間）</option>
                      <option value={5}>4泊5日（5日間）</option>
                      <option value={6}>5泊6日（6日間）</option>
                      <option value={7}>6泊7日（1週間）</option>
                      <option value={8}>7泊8日（8日間）</option>
                      <option value={9}>8泊9日（9日間）</option>
                      <option value={10}>9泊10日（10日間）</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">誰と行く？</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['ひとり旅', 'カップル・夫婦（2名）', '友達グループ', '家族・子連れ'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCompanion(c);
                          if (c === 'ひとり旅') {
                            setAdultCount(1);
                            setChildCount(0);
                            setIsSoloPlan(true);
                          } else {
                            if (!currentUser?.isGuest) {
                              setIsSoloPlan(false);
                            }
                            if (c === 'カップル・夫婦（2名）') {
                              setAdultCount(2);
                              setChildCount(0);
                            } else if (c === '友達グループ') {
                              setAdultCount(prev => (prev < 2 ? 3 : prev));
                              setChildCount(0);
                            } else if (c === '家族・子連れ') {
                              setAdultCount(prev => (prev < 1 ? 2 : prev));
                              setChildCount(prev => (prev < 1 ? 1 : prev));
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          companion === c
                            ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* 「友達グループ」「家族・子連れ」選択時に大人・子どもの人数を細かく指定できるUI */}
                  {(companion === '友達グループ' || companion === '家族・子連れ') && (
                    <div className="mt-2.5 p-3.5 bg-[#7A9D8C]/8 border border-[#7A9D8C]/30 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#557465] flex items-center gap-1">
                          <User size={13} /> 参加人数・構成を指定
                        </span>
                        <span className="text-[11px] font-extrabold text-stone-700 bg-white px-2.5 py-0.5 rounded-full border border-stone-200/80">
                          合計 {adultCount + childCount}名（大人{adultCount}・子ども{childCount}）
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {/* 大人カウンター */}
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-extrabold text-stone-800 leading-tight">大人</p>
                            <p className="text-[9px] font-bold text-stone-400">中学生以上</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                              disabled={adultCount <= 1}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-35 text-stone-700 font-extrabold text-sm flex items-center justify-center active:scale-95"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-xs font-extrabold text-stone-800">{adultCount}</span>
                            <button
                              type="button"
                              onClick={() => setAdultCount(prev => Math.min(20, prev + 1))}
                              className="w-7 h-7 rounded-lg bg-[#7A9D8C]/15 hover:bg-[#7A9D8C]/25 text-[#557465] font-extrabold text-sm flex items-center justify-center active:scale-95"
                            >
                              ＋
                            </button>
                          </div>
                        </div>

                        {/* 子どもカウンター */}
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-extrabold text-stone-800 leading-tight">子ども</p>
                            <p className="text-[9px] font-bold text-stone-400">小学生以下</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                              disabled={childCount <= 0}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-35 text-stone-700 font-extrabold text-sm flex items-center justify-center active:scale-95"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-xs font-extrabold text-stone-800">{childCount}</span>
                            <button
                              type="button"
                              onClick={() => setChildCount(prev => Math.min(15, prev + 1))}
                              className="w-7 h-7 rounded-lg bg-[#7A9D8C]/15 hover:bg-[#7A9D8C]/25 text-[#557465] font-extrabold text-sm flex items-center justify-center active:scale-95"
                            >
                              ＋
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] font-bold text-stone-500 leading-snug">
                        {childCount > 0
                          ? `🧸 お子様（${childCount}名）が無理なく楽しめるスポット・座敷やビュッフェ中心の宿を優先して提案します！`
                          : adultCount >= 5
                          ? `👥 大人${adultCount}名のグループ向けに、移動手段や個室予約のポイントも組み込んで提案します！`
                          : `✨ 大人${adultCount}名のグループにぴったりの食事・観光バランスでプランを組み立てます！`}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 mb-1 block pl-1">旅のテーマ</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['王道＆ご当地グルメ', '温泉・のんびり癒やし', 'カフェ＆写真映え', '絶景ドライブ＆体験'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          theme === t
                            ? 'bg-[#5E8473] text-white border-[#5E8473]'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {!currentUser?.isGuest && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-stone-700 block">しおりの操作スタイル</span>
                        <span className="text-[10px] font-bold text-stone-400">「誰と行く？」に合わせて自動切替</span>
                      </div>
                      <div className="flex bg-stone-200/70 p-0.5 rounded-xl shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsSoloPlan(true)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isSoloPlan ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
                          }`}
                        >
                          👤 {companion === 'ひとり旅' ? '1人旅' : '代表者のみ管理'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSoloPlan(false)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            !isSoloPlan ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
                          }`}
                        >
                          👥 みんなで共有
                        </button>
                      </div>
                    </div>
                    {companion !== 'ひとり旅' && isSoloPlan && (
                      <p className="text-[10px] font-bold text-[#557465] bg-[#7A9D8C]/10 px-2.5 py-1.5 rounded-xl leading-snug">
                        💡 招待コードを発行せず、代表者1人だけでしおりをサクサク編集できます（後から招待も可能です）
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* スクロール領域の外（下部固定フッター）に配置し、ボタン全体の当たり判定を100%確保 */}
              <div className="pt-3 border-t border-stone-100 shrink-0 bg-white relative z-10">
                <button
                  type="button"
                  disabled={isAiGenerating}
                  onClick={() => handleGenerate(false)}
                  className="w-full py-4 px-5 bg-gradient-to-r from-sky-200 via-sky-300/80 to-cyan-200 hover:brightness-105 text-sky-900 border border-sky-300 font-extrabold rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer select-none disabled:opacity-50"
                >
                  <Sparkles size={16} className="pointer-events-none shrink-0 text-sky-600" />
                  <span className="pointer-events-none">
                    {isAiGenerating ? 'Google AIがプランを作成中...' : 'この条件でプランを提案してもらう'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5 space-y-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1">
                    <Sparkles size={14} className="text-sky-500" /> AI提案プラン ({generatedPlans.length}件)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isAiGenerating}
                      onClick={() => handleGenerate(true)}
                      className="px-2.5 py-1 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 text-[10px] font-extrabold flex items-center gap-1 disabled:opacity-50"
                      title="AI無料枠を1回使ってGoogle Gemini APIで別プランを新規生成"
                    >
                      <Sparkles size={11} className="text-sky-600" />
                      {isAiGenerating ? '生成中...' : '✨ AIで別プラン再生成(1回消費)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeneratedPlans(null)}
                      className="text-[11px] font-bold text-stone-500 underline hover:text-stone-700"
                    >
                      条件変更
                    </button>
                  </div>
                </div>

                {/* キャッシュヒット時の節約通知バナー */}
                <div className={`px-3 py-2 rounded-2xl border text-[11px] font-bold flex items-center justify-between gap-2 ${
                  planSourceType === 'cache'
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                    : 'bg-sky-50 border-sky-200 text-sky-900'
                }`}>
                  <span>
                    {planSourceType === 'cache'
                      ? '⚡ 定番・保存キャッシュから高速表示しました（本日のAI無料枠は消費していません）'
                      : '✨ Google Gemini AIでカスタム生成しました（本日のAI枠を1回使用）'}
                  </span>
                </div>

                {generatedPlans.map((plan, pIdx) => {
                  const isExpanded = expandedPlanIdx === pIdx;
                  return (
                    <div
                      key={pIdx}
                      className="p-4 rounded-3xl bg-stone-50 border border-stone-200/90 space-y-2.5 shadow-2xs"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200/80 text-[10px] font-extrabold">
                        {plan.badge}
                      </span>

                      <div>
                        <p className="text-[10px] font-bold text-stone-400 mb-1">旅のタイトル（タップして編集可能）</p>
                        <div className="relative">
                          <input
                            type="text"
                            value={plan.title}
                            onFocus={() => setEditingTitleIdx(pIdx)}
                            onBlur={() => setEditingTitleIdx(null)}
                            onChange={e => handleUpdatePlanTitle(pIdx, e.target.value)}
                            className={`w-full px-3 py-2 bg-white rounded-xl border text-xs font-extrabold text-stone-800 focus:outline-none transition-all ${
                              editingTitleIdx === pIdx ? 'border-[#7A9D8C] ring-2 ring-[#7A9D8C]/25' : 'border-stone-200'
                            }`}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-relaxed">{plan.description}</p>

                      <button
                        type="button"
                        onClick={() => setExpandedPlanIdx(isExpanded ? null : pIdx)}
                        className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>スケジュール詳細・編集 ({plan.events.length}件)</span>
                        <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="bg-white p-3 rounded-2xl border border-stone-200/80 space-y-2 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in">
                          {plan.events.map((ev, eIdx) => (
                            <div key={eIdx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-[#7A9D8C]/15 text-[#557465] text-[10px] font-extrabold shrink-0">
                                  {ev.date ? ev.date.slice(5).replace('-', '/') : ''}
                                </span>
                                <input
                                  type="time"
                                  value={ev.time}
                                  onChange={e => handleUpdatePlanEvent(pIdx, eIdx, 'time', e.target.value)}
                                  className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[10px] font-mono font-bold text-stone-700 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={ev.title}
                                  onChange={e => handleUpdatePlanEvent(pIdx, eIdx, 'title', e.target.value)}
                                  className="flex-1 min-w-0 px-2 py-0.5 bg-white border border-stone-200 rounded text-[11px] font-bold text-stone-800"
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold px-1">
                                <span className="truncate">📍 {ev.location}</span>
                                <span className="shrink-0">¥{Number(ev.cost || 0).toLocaleString()}/人</span>
                              </div>
                              {ev.memo && (
                                <p className="text-[10px] text-stone-500 bg-white p-1.5 rounded-lg border border-stone-100 leading-relaxed">
                                  {ev.memo}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectPlan(plan)}
                        className="w-full py-3 bg-[#7A9D8C] hover:bg-[#688a79] text-white font-extrabold rounded-2xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                      >
                        <Check size={15} />
                        <span>このプランでしおりを作成する（¥{Number(plan.budget || 0).toLocaleString()}/人）</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          )
        ) : (
          /* チャット相談モード（上部タブで予算・移動手段・重視ポイント・出発日をいつでも切り替え可能） */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* ★ 上部設定タブ：出発日・日数・予算タブ・移動重視タブ */}
            <div className="mb-2.5 p-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-0.5 pl-0.5">出発地 → 移動手段</label>
                  <select
                    value={transportMethod}
                    onChange={e => setTransportMethod(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  >
                    {TRANSPORT_METHODS.map(m => (
                      <option key={m.id} value={m.id}>{departurePoint.slice(0, 5)}発・{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-0.5 pl-0.5">移動の重視ポイント</label>
                  <select
                    value={transportPriority}
                    onChange={e => setTransportPriority(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  >
                    {TRANSPORT_PRIORITIES.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 上部でワンタップ選択できる「予算」タブ */}
              <div>
                <div className="flex items-center justify-between mb-1 pl-0.5">
                  <span className="text-[10px] font-bold text-stone-400">💰 1人あたりの予算タブ</span>
                  <span className="text-[10px] font-extrabold text-[#557465]">{budgetTier}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {BUDGET_TIER_OPTIONS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudgetTier(b.id)}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-extrabold border transition-all truncate ${
                        budgetTier === b.id
                          ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-0.5 pl-0.5">出発日</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-0.5 pl-0.5">日数</label>
                  <select
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
                  >
                    <option value={1}>日帰り（1日）</option>
                    <option value={2}>1泊2日（2日間）</option>
                    <option value={3}>2泊3日（3日間）</option>
                    <option value={4}>3泊4日（4日間）</option>
                    <option value={5}>4泊5日（5日間）</option>
                    <option value={6}>5泊6日（6日間）</option>
                    <option value={7}>6泊7日（1週間）</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-3 pr-0.5">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#7A9D8C] text-white font-bold rounded-br-sm'
                        : 'bg-stone-100 text-stone-800 font-medium rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.plan && (
                    <div className="mt-2 w-full bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 space-y-2.5">
                      <p className="text-xs font-extrabold text-stone-800">{m.plan.title}</p>
                      <div className="space-y-1 max-h-44 overflow-y-auto no-scrollbar">
                        {m.plan.events.map((ev, eIdx) => (
                          <div key={eIdx} className="text-[11px] bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-extrabold shrink-0">
                              {ev.date ? ev.date.slice(5).replace('-', '/') : ''}
                            </span>
                            <span className="font-mono font-bold text-stone-500 shrink-0">{ev.time}</span>
                            <span className="font-bold text-stone-800 truncate">{ev.title}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectPlan(m.plan)}
                        className="w-full py-2.5 bg-gradient-to-r from-sky-100 via-sky-200/85 to-cyan-100 hover:brightness-95 text-sky-900 border border-sky-300 font-extrabold rounded-xl text-xs shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={13} className="text-sky-600" />
                        <span>このプランをしおりに反映する</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ★ 入力欄のすぐ上に配置した提案ボタン：押すといきなり送信せず入力欄にセットして自由に書き足せる */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 pt-1 shrink-0">
              {CHAT_QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    const cleanText = suggestion.replace(/^[^\s]+\s/, '');
                    setChatInput(prev => prev ? `${prev} ${cleanText}` : cleanText);
                  }}
                  className="whitespace-nowrap px-3 py-1.5 bg-[#7A9D8C]/10 hover:bg-[#7A9D8C]/20 text-[#4A6B5D] border border-[#7A9D8C]/25 rounded-full text-[11px] font-bold transition-colors shrink-0 active:scale-95 cursor-pointer"
                  title="タップして入力欄に挿入"
                >
                  ＋ {suggestion}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="pt-2 border-t border-stone-100 flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="例: 温泉と海鮮が美味しい1泊2日プランを作って"
                className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiGenerating}
                className="px-4 py-3 bg-[#5E8473] hover:bg-[#4A6B5D] text-white font-bold rounded-xl text-xs disabled:opacity-40 shrink-0 transition-colors"
              >
                {isAiGenerating ? '生成中' : '送信'}
              </button>
            </form>
          </div>
        )}

        {showRewardAdModal && (
          <RewardVideoAdModal
            onClose={() => setShowRewardAdModal(false)}
            onCompleteReward={(next) => setQuotaStatus(next)}
          />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// しおり内のAIコンシェルジュ相談モーダル (AiConciergeChatModal)
// ------------------------------------------
function AiConciergeChatModal({ trip, selectedDate, isReadOnly, currentUser, onClose, onAddSuggestedEvent }) {
  useLockBodyScroll(true);
  const dest = trip.destination || '京都府';
  const [input, setInput] = useState('');
  const [spotBudgetCap, setSpotBudgetCap] = useState('指定なし');
  const [transportFilter, setTransportFilter] = useState(trip.transportMethod || 'shinkansen_train');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState(() => getAiQuotaStatus());
  const [showRewardAd, setShowRewardAd] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `「${trip.title}（${dest}）」のAIコンシェルジュです✨\n上のタブで「予算上限」や「移動手段」を選び、下の候補ボタン（タップで入力欄に入ります）から何でも相談してください！`
    }
  ]);

  const SPOT_BUDGET_TABS = ['指定なし', '〜¥1,500', '〜¥3,000', '〜¥5,000', '贅沢ディナー'];

  const QUICK_PROMPTS = [
    '☕ 近くで評判のカフェを教えて',
    '🍽️ このエリアの名物ランチは？',
    '☔ 雨でも楽しめるスポットは？',
    '🎁 おすすめのお土産スポット'
  ];

  const handleSend = async (e, presetText) => {
    if (e) e.preventDefault();
    const rawQuery = (presetText || input).trim();
    if (!rawQuery || isAiLoading) return;
    const budgetHint = spotBudgetCap !== '指定なし' ? `（予算目安:${spotBudgetCap}）` : '';
    const query = `${rawQuery}${budgetHint}`;

    setMessages(prev => [...prev, { role: 'user', text: query }]);
    if (!presetText) setInput('');

    // 1. 定番クイック質問または過去キャッシュがある場合はAPI消費ゼロで即答
    const cacheKey = `concierge_${dest}_${query}`;
    const cached = getCachedAiResponse(cacheKey);
    if (cached) {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: `${cached.text}\n（※キャッシュから高速表示・AI枠消費0⚡）`,
          spot: cached.spot
        }
      ]);
      return;
    }

    // 2. 自由入力の質問はレートリミット（1日5回＋動画広告ボーナス）をチェックしてGemini APIを呼び出す
    const quotaCheck = consumeAiQuota();
    setQuotaStatus(quotaCheck.status);
    if (!quotaCheck.ok) {
      setShowRewardAd(true);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: `本日のAI無料相談枠（${quotaCheck.status.limit}回）を使い切りました🙏\n上の「🎬 広告で＋${REWARD_AD_BONUS_COUNT}回」から動画を見ると、すぐに相談枠を回復できます！`
        }
      ]);
      return;
    }

    setIsAiLoading(true);
    try {
      const schema = {
        type: "OBJECT",
        properties: {
          replyText: { type: "STRING" },
          spot: {
            type: "OBJECT",
            properties: {
              time: { type: "STRING" },
              title: { type: "STRING" },
              type: { type: "STRING" },
              location: { type: "STRING" },
              cost: { type: "INTEGER" },
              memo: { type: "STRING" }
            },
            propertyOrdering: ["time", "title", "type", "location", "cost", "memo"]
          }
        },
        propertyOrdering: ["replyText", "spot"]
      };

      const aiRes = await callGoogleGeminiStructured({
        systemPrompt: "あなたは旅行中のサポートを行うAIコンシェルジュです。質問に対する簡潔な回答(replyText)と、しおりにそのまま追加できる実在のおすすめスポット1件(spot)をJSONで返してください。spot.typeは meal, sightseeing, active, transport, hotel のいずれかにしてください。",
        userPrompt: `旅行先:${dest}（しおり名:${trip.title}） / 相談内容:「${query}」`,
        responseSchema: schema
      });

      if (aiRes && aiRes.spot) {
        const resPayload = {
          text: aiRes.replyText || `「${query}」に合わせて、${dest}でおすすめのスポットをピックアップしました！`,
          spot: {
            time: aiRes.spot.time || '14:00',
            title: aiRes.spot.title || `${dest}のおすすめスポット`,
            type: ['meal', 'sightseeing', 'active', 'transport', 'hotel'].includes(aiRes.spot.type) ? aiRes.spot.type : 'sightseeing',
            location: aiRes.spot.location || dest,
            cost: Number(aiRes.spot.cost) || 1500,
            memo: aiRes.spot.memo || ''
          }
        };
        setCachedAiResponse(cacheKey, resPayload);
        setMessages(prev => [...prev, { role: 'ai', text: resPayload.text, spot: resPayload.spot }]);
        setIsAiLoading(false);
        return;
      }
      throw new Error('Fallback');
    } catch (err) {
      const isCafe = /カフェ|コーヒー|スイーツ|甘味|休憩/.test(query);
      const isMeal = /ランチ|ご飯|ごはん|ディナー|夕飯|名物|グルメ/.test(query);
      const isRain = /雨|屋内|美術館|水族館/.test(query);

      const suggestedSpot = isCafe
        ? {
            time: '15:00',
            title: `${dest}の人気古民家カフェ＆ご当地スイーツ`,
            type: 'meal',
            location: `${dest} カフェ`,
            cost: 1500,
            memo: '【AIおすすめ】観光の合間にほっと一息つける口コミ高評価のカフェです。'
          }
        : isMeal
        ? {
            time: '12:30',
            title: `${dest}の名物ご当地ランチ（老舗人気店）`,
            type: 'meal',
            location: `${dest} ランチ`,
            cost: 2400,
            memo: '【AIおすすめ】地元の旬の食材を堪能できる定番ランチスポット。'
          }
        : isRain
        ? {
            time: '13:30',
            title: `${dest}の美術館・ミュージアム＆屋内体験`,
            type: 'sightseeing',
            location: `${dest} 美術館`,
            cost: 1200,
            memo: '【AIおすすめ】天候を問わず快適に楽しめる屋内スポットです。'
          }
        : {
            time: '16:00',
            title: `${dest}の定番お土産＆セレクトショップ巡り`,
            type: 'sightseeing',
            location: `${dest} 駅 お土産`,
            cost: 2500,
            memo: '【AIおすすめ】限定スイーツや雑貨が揃う人気のお土産スポット。'
          };

      const fallbackPayload = {
        text: `「${query}」に合わせて、${dest}でおすすめのスポットをピックアップしました！ワンタップでしおりに追加できます。`,
        spot: suggestedSpot
      };
      setCachedAiResponse(cacheKey, fallbackPayload);
      setMessages(prev => [...prev, { role: 'ai', text: fallbackPayload.text, spot: fallbackPayload.spot }]);
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[250] flex justify-center items-center p-4 animate-in fade-in" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl h-[78vh] flex flex-col animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 shrink-0">
          <h3 className="font-extrabold text-base text-stone-800 flex items-center gap-1.5">
            <Sparkles size={18} className="text-[#5E8473]" /> AI旅コンシェルジュに相談
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* レートリミット残数＆リワード広告バー */}
        <div className="mb-2 px-3 py-1.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-[10px] font-bold shrink-0">
          <span className="text-stone-600">
            本日のAI相談枠: <strong className={quotaStatus.remaining === 0 ? 'text-red-500' : 'text-[#557465]'}>残り{quotaStatus.remaining}/{quotaStatus.limit}回</strong>（同じ質問はキャッシュ0円）
          </span>
          <button
            type="button"
            onClick={() => setShowRewardAd(true)}
            className="px-2.5 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 font-extrabold"
          >
            🎬 広告で＋{REWARD_AD_BONUS_COUNT}回
          </button>
        </div>

        {/* ★ AIコンシェルジュ上部の「予算タブ」＆「移動手段タブ」 */}
        <div className="mb-2.5 p-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold text-stone-500">💰 1人あたり予算上限タブ</span>
            <span className="text-[10px] font-extrabold text-[#557465]">{spotBudgetCap}</span>
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {SPOT_BUDGET_TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setSpotBudgetCap(tab)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all shrink-0 ${
                  spotBudgetCap === tab
                    ? 'bg-[#7A9D8C] text-white border-[#7A9D8C]'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar pt-0.5">
            {TRANSPORT_METHODS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setTransportFilter(m.id)}
                className={`whitespace-nowrap px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all shrink-0 ${
                  transportFilter === m.id
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-3 pr-0.5">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#7A9D8C] text-white font-bold rounded-br-sm'
                    : 'bg-stone-100 text-stone-800 font-medium rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
              {m.spot && (
                <div className="mt-2 w-full bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-stone-800">{m.spot.title}</p>
                      <p className="text-[10px] font-bold text-stone-500 mt-0.5">
                        目安時間 {m.spot.time} / 予算 ¥{Number(m.spot.cost).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-100">
                    {m.spot.memo}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddSuggestedEvent && onAddSuggestedEvent(m.spot)}
                    className="w-full py-2.5 bg-gradient-to-r from-sky-100 via-sky-200/85 to-cyan-100 hover:brightness-95 text-sky-900 border border-sky-300 font-extrabold rounded-xl text-xs shadow-2xs flex items-center justify-center gap-1"
                  >
                    <Plus size={14} className="text-sky-600" /> この予定をしおりに追加する
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ★ 押したらいきなりチャット送信せず、入力欄にテキストが入る提案チップ */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 pt-1 shrink-0">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                const cleanPrompt = prompt.replace(/^[^\s]+\s/, '');
                setInput(prev => prev ? `${prev} ${cleanPrompt}` : cleanPrompt);
              }}
              className="whitespace-nowrap px-3 py-1.5 bg-[#7A9D8C]/10 hover:bg-[#7A9D8C]/20 text-[#4A6B5D] border border-[#7A9D8C]/25 rounded-full text-[11px] font-bold transition-colors shrink-0 active:scale-95"
              title="タップして入力欄に挿入"
            >
              ＋ {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="pt-2 border-t border-stone-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="AIに質問・相談を入力..."
            className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAiLoading}
            className="px-4 py-3 bg-[#5E8473] hover:bg-[#4A6B5D] text-white font-bold rounded-xl text-xs disabled:opacity-40 shrink-0 transition-colors"
          >
            {isAiLoading ? '生成中' : '送信'}
          </button>
        </form>

        {showRewardAd && (
          <RewardVideoAdModal
            onClose={() => setShowRewardAd(false)}
            onCompleteReward={(next) => setQuotaStatus(next)}
          />
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
          <MessageSquare size={16} className="text-[#7A9D8C]" /> コメント ({comments.length}件)
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="感想や質問をコメントする..."
            className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7A9D8C]"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-2.5 bg-[#7A9D8C] text-white font-bold rounded-xl text-xs disabled:opacity-40 shrink-0"
          >
            投稿
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-xs text-stone-400 font-bold text-center py-6">まだコメントはありません</p>
        ) : (
          <div className="space-y-3 divide-y divide-stone-100">
            {comments.map(c => (
              <div key={c.id} className="pt-3 first:pt-0 flex items-start gap-2.5">
                <img
                  src={c.authorAvatar || FEMALE_AVATARS[0]}
                  alt={c.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800">{c.authorName}</span>
                    <span className="text-[10px] text-stone-400">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Default Export App (ErrorBoundary Wrapper)
// ==========================================
export default function App() {
  return (
    <ErrorBoundary>
      <TabitabiApp />
    </ErrorBoundary>
  );
}