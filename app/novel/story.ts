export type CharId =
  | 'protagonist' | 'deputy' | 'junior_one' | 'junior_two'
  | 'chief' | 'manager' | 'mayor' | 'district' | 'caller' | 'buddy';

export type Position = 'left' | 'center' | 'right' | 'left_low' | 'center_low' | 'right_low' | 'caller';

export interface CharDisplay { id: CharId; pos: Position; }

export type Beat =
  | { kind: 'narration'; text: string }
  | { kind: 'dialogue'; who: CharId; text: string }
  | { kind: 'bg'; name: string }
  | { kind: 'show'; chars: CharDisplay[] }
  | { kind: 'hide'; ids: CharId[] }
  | { kind: 'hideAll' }
  | { kind: 'effects'; mentality?: number; team_bond?: number }
  | { kind: 'choice'; options: { text: string; effects?: { mentality?: number; team_bond?: number }; jump: string }[] }
  | { kind: 'ending'; text: string };

export interface Scene { beats: Beat[]; next?: string; }

export const CHAR_INFO: Record<CharId, { name: string; color: string }> = {
  protagonist: { name: '주인공',  color: '#d9f0ff' },
  deputy:      { name: '차석',    color: '#ffe0b3' },
  junior_one:  { name: '삼석',    color: '#ffd7a8' },
  junior_two:  { name: '사석',    color: '#ffe8c7' },
  chief:       { name: '팀장',    color: '#ffd0d0' },
  manager:     { name: '과장',    color: '#f6c1ff' },
  mayor:       { name: '시장',    color: '#e6e6e6' },
  district:    { name: '구청장',  color: '#e6ffd8' },
  caller:      { name: '민원인',  color: '#ffcccc' },
  buddy:       { name: '동기',    color: '#d0ffd8' },
};

const RAW = 'https://raw.githubusercontent.com/GnuDaSsa/AI/feature/novel-lab-initial/novel-lab/renpy/game/images';
export const BG_URL = (name: string) => `${RAW}/bg/${name}.png`;
export const CHAR_URL = (id: CharId) => `${RAW}/chars/${id}_default.png`;

export const STORY: Record<string, Scene> = {
  start: {
    beats: [
      { kind: 'narration', text: '1년의 수험기간 끝에 공무원에 합격했다.' },
      { kind: 'narration', text: '안전한 철밥통의 미래가 나를 기다린다.' },
      { kind: 'narration', text: '적어도 그때의 나는, 그렇게 믿고 있었다.' },
      { kind: 'narration', text: '당신의 직렬은?' },
      { kind: 'choice', options: [{ text: '토목직', jump: 'choose_civil' }] },
    ],
  },

  choose_civil: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'effects', mentality: 1 },
      { kind: 'show', chars: [{ id: 'protagonist', pos: 'center' }] },
      { kind: 'narration', text: '토목직.' },
      { kind: 'narration', text: '서류에 적힌 두 글자가 왠지 단단해 보였다.' },
      { kind: 'narration', text: '도로, 하천, 공사, 현장.' },
      { kind: 'narration', text: '어쩐지 세상을 실제로 움직이는 일 같았다.' },
      { kind: 'hide', ids: ['protagonist'] },
    ],
    next: 'appointment_day',
  },

  appointment_day: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'bg', name: 'city_hall' },
      { kind: 'narration', text: '발령 당일.' },
      { kind: 'narration', text: '정장을 입은 동기들과 함께 시청 대강당에 줄지어 섰다.' },
      { kind: 'dialogue', who: 'mayor', text: '임용을 축하합니다. 시민을 위해 책임감을 갖고 일해주시기 바랍니다.' },
      { kind: 'narration', text: '시장님의 손에서 임용장을 받는 순간, 드디어 인생이 시작되는 것 같았다.' },
      { kind: 'show', chars: [{ id: 'buddy', pos: 'left' }, { id: 'protagonist', pos: 'right' }] },
      { kind: 'dialogue', who: 'buddy', text: '야, 우리 진짜 공무원 됐다.' },
      { kind: 'dialogue', who: 'protagonist', text: '그러게. 이제 고생 끝이지.' },
      { kind: 'narration', text: '그 말은 오래 가지 못했다.' },
      { kind: 'hideAll' },
      { kind: 'bg', name: 'district_office_exterior' },
      { kind: 'narration', text: '오후에는 곧바로 중원구청으로 이동했다.' },
      { kind: 'dialogue', who: 'district', text: '반갑습니다. 각 부서에서 잘 적응하시길 바랍니다.' },
      { kind: 'narration', text: '인사를 마치고 나는 건설과로 배치되었다.' },
    ],
    next: 'first_desk',
  },

  first_desk: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'bg', name: 'office_construction' },
      { kind: 'narration', text: '사무실 문이 열리자 프린터 소리와 전화벨, 서류 넘기는 소리가 한꺼번에 들이쳤다.' },
      { kind: 'show', chars: [{ id: 'chief', pos: 'right' }] },
      { kind: 'dialogue', who: 'chief', text: '오늘부터 우리 팀에서 일할 신규야. 다들 얼굴만 익혀둬.' },
      { kind: 'narration', text: '과장, 팀장, 차석, 삼석, 사석.' },
      { kind: 'narration', text: '그리고 맨 끝에 나.' },
      { kind: 'hide', ids: ['chief'] },
      { kind: 'show', chars: [{ id: 'manager', pos: 'left' }] },
      { kind: 'dialogue', who: 'manager', text: '건설과는 처음부터 설명서가 친절한 곳은 아니야.' },
      { kind: 'hide', ids: ['manager'] },
      { kind: 'show', chars: [{ id: 'deputy', pos: 'left' }] },
      { kind: 'dialogue', who: 'deputy', text: '이쪽 와서 앉아요. 오늘부터 여기 자리 써요.' },
      { kind: 'hide', ids: ['deputy'] },
      { kind: 'show', chars: [{ id: 'junior_one', pos: 'left' }] },
      { kind: 'dialogue', who: 'junior_one', text: '모르면 메모부터 해요. 나중에 진짜 기억 안 납니다.' },
      { kind: 'hide', ids: ['junior_one'] },
      { kind: 'show', chars: [{ id: 'junior_two', pos: 'right' }] },
      { kind: 'dialogue', who: 'junior_two', text: '전화 오면 일단 떨지 말고, 누가 언제 뭘 원하는지만 적어요.' },
      { kind: 'hide', ids: ['junior_two'] },
      { kind: 'narration', text: '여기저기 인사를 드리고 안내받은 자리에 앉았다.' },
      { kind: 'narration', text: '책상에는 먼지가 수북했고, 모니터 옆엔 이름 모를 열쇠 하나가 굴러다니고 있었다.' },
      { kind: 'show', chars: [{ id: 'protagonist', pos: 'right' }] },
      { kind: 'dialogue', who: 'protagonist', text: '이게 뭐지...' },
      { kind: 'narration', text: '그 찰나, 전화가 울렸다.' },
    ],
    next: 'first_call',
  },

  first_call: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'show', chars: [{ id: 'caller', pos: 'caller' }, { id: 'protagonist', pos: 'left' }] },
      { kind: 'dialogue', who: 'caller', text: '여보세요? 도로 파헤쳐놓고 왜 아직도 정리를 안 해요?' },
      { kind: 'dialogue', who: 'protagonist', text: '아, 제가 오늘 처음 와서...' },
      { kind: 'dialogue', who: 'caller', text: '처음 오면 아무것도 안 해도 돼요? 담당이면 책임을 져야지!' },
      { kind: 'narration', text: '욕은 아니었지만, 욕보다 더 선명하게 아팠다.' },
      { kind: 'effects', mentality: -1 },
      { kind: 'hide', ids: ['caller'] },
      { kind: 'show', chars: [{ id: 'deputy', pos: 'right' }] },
      { kind: 'dialogue', who: 'deputy', text: '일단 메모해요. 위치, 연락처, 뭐가 문제인지.' },
      { kind: 'dialogue', who: 'deputy', text: '그리고 이 파일이랑 이 종이 두 장. 전임자가 남긴 인수인계예요.' },
      { kind: 'narration', text: '파일은 뒤죽박죽 정리된 공사 서류철이었고, 종이 두 장에는 공사명과 업체명, 민원 다발 지점만 적혀 있었다.' },
      { kind: 'dialogue', who: 'deputy', text: '지금부터 이 구간 공사 담당은 당신이에요. 책임감 있어야 해요.' },
      { kind: 'dialogue', who: 'protagonist', text: '네...' },
      { kind: 'narration', text: '근데 진짜 하나도 무슨 소린지 모르겠다.' },
      { kind: 'choice', options: [
        { text: '일단 아는 척하며 메모부터 정리한다', effects: { mentality: 1, team_bond: 1 }, jump: 'early_days' },
        { text: '솔직하게 잘 모르겠다고 다시 묻는다', effects: { team_bond: 2 }, jump: 'early_days' },
      ]},
    ],
  },

  early_days: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'narration', text: '그날 이후로는 매일이 속도전이었다.' },
      { kind: 'narration', text: '결재선, 설계변경, 준공계, 기성검사.' },
      { kind: 'narration', text: '단어는 계속 들리는데 문장은 끝까지 이해되지 않았다.' },
      { kind: 'show', chars: [{ id: 'chief', pos: 'right' }, { id: 'manager', pos: 'left' }] },
      { kind: 'dialogue', who: 'chief', text: '오전에 현장 나갔다 와서 보고 올리고, 업체에도 전화 넣어.' },
      { kind: 'dialogue', who: 'manager', text: '민원 들어오면 혼자 끌어안지 말고 꼭 보고해.' },
      { kind: 'hide', ids: ['chief', 'manager'] },
      { kind: 'show', chars: [{ id: 'deputy', pos: 'left' }] },
      { kind: 'dialogue', who: 'deputy', text: '모르면 물어봐요. 대신 같은 걸 세 번은 묻지 말고.' },
      { kind: 'hide', ids: ['deputy'] },
      { kind: 'show', chars: [{ id: 'junior_one', pos: 'left' }, { id: 'junior_two', pos: 'right' }] },
      { kind: 'dialogue', who: 'junior_one', text: '처음 3개월은 원래 다 멍합니다.' },
      { kind: 'dialogue', who: 'junior_two', text: '저도 아직 멍해요.' },
      { kind: 'narration', text: '하루 종일 정신없이 움직이다 보면 퇴근 무렵엔 내가 뭘 한 건지 설명도 못 하겠는데, 이상하게 다음 날 아침엔 또 출근하고 있었다.' },
    ],
    next: 'winter_arc',
  },

  winter_arc: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'bg', name: 'winter_road' },
      { kind: 'show', chars: [{ id: 'chief', pos: 'left' }] },
      { kind: 'narration', text: '계절이 바뀌고 겨울이 왔다.' },
      { kind: 'narration', text: '건설과의 공기는 더 차가워졌고, 설해대책 기간이 시작되었다.' },
      { kind: 'dialogue', who: 'chief', text: '오늘 밤 눈 예보 있어. 비상대기 걸릴 수 있으니까 핸드폰 소리 키워둬.' },
      { kind: 'narration', text: '새벽에 울리는 단체 연락, 제설재 확인, 민원 대비 연락망.' },
      { kind: 'narration', text: '처음에는 내가 왜 새벽 다섯 시에 도로 결빙 사진을 보고 있는지 이해할 수 없었다.' },
      { kind: 'choice', options: [
        { text: '투덜거리면서도 현장 흐름을 익힌다', effects: { mentality: 1 }, jump: 'winter_relief' },
        { text: '긴장한 채로 매뉴얼을 반복해서 읽는다', effects: { team_bond: 1 }, jump: 'winter_relief' },
      ]},
    ],
  },

  winter_relief: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'show', chars: [{ id: 'deputy', pos: 'right' }] },
      { kind: 'narration', text: '그래도 겨울에는 한 가지 위안이 있었다.' },
      { kind: 'narration', text: '3월까지는 추워서 사람들이 덜 싸돌아다닌다.' },
      { kind: 'narration', text: '도로 점용이니 포장 파손이니 주정차 동선이니, 그런 민원이 확실히 줄었다.' },
      { kind: 'narration', text: '사무실 난방 바람을 맞으며 조용한 오전을 보내는 날이면, 아주 잠깐 행복하다는 생각도 들었다.' },
      { kind: 'dialogue', who: 'deputy', text: '이때 숨 좀 돌려놔요. 4월 오면 다시 시작이니까.' },
      { kind: 'narration', text: '그 말은 예언이었다.' },
    ],
    next: 'spring_arc',
  },

  spring_arc: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'bg', name: 'spring_street' },
      { kind: 'narration', text: '4월이 되자 민원이 돌아왔다.' },
      { kind: 'narration', text: '날씨가 풀리자 사람들도 밖으로 나왔고, 불편도 요구도 같이 살아났다.' },
      { kind: 'show', chars: [{ id: 'caller', pos: 'caller' }] },
      { kind: 'dialogue', who: 'caller', text: '이거 원래 안 되는 거 아는데, 이번만 되게 해주시면 안 돼요?' },
      { kind: 'dialogue', who: 'caller', text: '옆 건물은 해줬다던데 왜 우리만 안 돼요?' },
      { kind: 'dialogue', who: 'caller', text: '오늘 당장 공사 차량 빼고, 소음도 없애고, 통행도 보장해주세요.' },
      { kind: 'narration', text: '안 되는 걸 되게 해달라는 말은 언제나 아주 자연스러운 얼굴로 도착했다.' },
      { kind: 'narration', text: '현장 확인을 나가면 업체는 예산과 일정 얘기를 하고, 민원인은 지금 당장 해결하라고 하고, 내부에선 절차부터 확인하라고 했다.' },
      { kind: 'show', chars: [{ id: 'protagonist', pos: 'left' }] },
      { kind: 'dialogue', who: 'protagonist', text: '다 맞는 말 같은데 동시에 다 들어줄 수는 없잖아요...' },
      { kind: 'choice', options: [
        { text: '원칙대로 설명하고 욕을 먹는다', effects: { mentality: -1 }, jump: 'spring_resolution' },
        { text: '최대한 중간안을 찾아 뛰어다닌다', effects: { mentality: -1, team_bond: 1 }, jump: 'spring_resolution' },
      ]},
    ],
  },

  spring_resolution: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'show', chars: [{ id: 'deputy', pos: 'left' }, { id: 'manager', pos: 'right' }] },
      { kind: 'narration', text: '어느 쪽을 택해도 완벽한 해결은 없었다.' },
      { kind: 'narration', text: '대신 조금씩 알게 되었다.' },
      { kind: 'narration', text: '민원은 문제 하나만 담고 오는 게 아니라, 사람의 조급함과 억울함과 기대까지 같이 실려 온다는 걸.' },
      { kind: 'dialogue', who: 'deputy', text: '버티는 것도 실력이에요.' },
      { kind: 'dialogue', who: 'manager', text: '그래도 너, 처음보단 표정이 덜 놀라네.' },
      { kind: 'narration', text: '그 말이 칭찬인지 위로인지는 모르겠지만, 이상하게 오래 남았다.' },
    ],
    next: 'transfer_end',
  },

  transfer_end: {
    beats: [
      { kind: 'hideAll' },
      { kind: 'bg', name: 'office_evening' },
      { kind: 'show', chars: [{ id: 'buddy', pos: 'left' }] },
      { kind: 'narration', text: '그렇게 정신없이 계절이 한 바퀴 돌았다.' },
      { kind: 'narration', text: '모든 게 익숙해질 즈음, 인사이동 명단이 내려왔다.' },
      { kind: 'dialogue', who: 'buddy', text: '야, 나 다른 동으로 간다.' },
      { kind: 'hide', ids: ['buddy'] },
      { kind: 'show', chars: [{ id: 'deputy', pos: 'left' }, { id: 'protagonist', pos: 'right' }] },
      { kind: 'dialogue', who: 'deputy', text: '저도 이번에 이동이에요. 다음 담당자 오면 파일 위치부터 알려줘야겠네.' },
      { kind: 'show', chars: [{ id: 'junior_one', pos: 'center' }] },
      { kind: 'dialogue', who: 'junior_one', text: '차석님 가시면 팀 분위기 진짜 달라지겠는데요.' },
      { kind: 'hide', ids: ['junior_one'] },
      { kind: 'show', chars: [{ id: 'junior_two', pos: 'center' }] },
      { kind: 'dialogue', who: 'junior_two', text: '이제 나는 누구 뒤에 숨어야 하지...' },
      { kind: 'hide', ids: ['junior_two'] },
      { kind: 'dialogue', who: 'protagonist', text: '이제 좀 알 것 같았는데, 또 바뀌네요.' },
      { kind: 'dialogue', who: 'deputy', text: '원래 그런 거예요. 남는 사람도 있고, 가는 사람도 있고.' },
      { kind: 'narration', text: '정든 사람들과 인사를 나누는 순간, 입직 첫날보다 더 이상한 기분이 들었다.' },
      { kind: 'narration', text: '도망치고 싶던 곳인데, 막상 떠난다니 아쉬웠다.' },
      { kind: 'narration', text: '1년 전의 나는 철밥통을 상상했다.' },
      { kind: 'narration', text: '지금의 나는, 사람과 현장과 민원 사이에서 겨우 버티는 법을 조금 배웠다.' },
      { kind: 'narration', text: '그리고 내일도 아마, 전화벨 소리와 함께 공무원 인생은 계속될 것이다.' },
      { kind: 'ending', text: '1년 차 토목직 엔딩' },
    ],
  },
};
