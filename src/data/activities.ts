// Random activity generators for the activity log
const workActivities: Record<string, string[]> = {
  tasky: ['reviewing project timeline', 'updating Gantt chart', 'scheduling team sync', 'preparing quarterly OKRs'],
  finy: ['analyzing Q3 budget', 'running financial projections', 'reviewing expense reports', 'calculating ROI metrics'],
  legaly: ['reviewing contract terms', 'checking compliance docs', 'drafting NDA', 'updating privacy policy'],
  skepty: ['challenging project assumptions', 'writing risk assessment', 'questioning market forecast', 'flagging potential issues'],
  audity: ['auditing expense records', 'checking process compliance', 'reviewing access logs', 'documenting findings'],
  pixely: ['designing new UI components', 'tweaking color palette', 'prototyping in Figma', 'reviewing design system'],
  buildy: ['deploying API update', 'optimizing database queries', 'reviewing pull requests', 'refactoring auth module'],
  testy: ['writing integration tests', 'filing bug report #347', 'running regression suite', 'testing edge cases'],
  buzzy: ['scheduling viral tweet', 'analyzing TikTok trends', 'crafting meme strategy', 'monitoring engagement metrics'],
  wordy: ['polishing blog draft', 'writing product copy', 'editing newsletter', 'crafting tagline variations'],
  edity: ['color grading promo video', 'editing YouTube thumbnail', 'adding motion graphics', 'rendering final cut'],
  searchy: ['optimizing meta tags', 'analyzing keyword rankings', 'building backlink strategy', 'checking SERP positions'],
  growthy: ['running A/B test', 'analyzing funnel data', 'setting up growth experiment', 'tracking conversion rates'],
  logoy: ['refining brand guidelines', 'designing social assets', 'choosing typography', 'creating icon set'],
  helpy: ['responding to support ticket', 'updating FAQ page', 'helping customer with onboarding', 'writing support macro'],
  clicky: ['analyzing heatmap data', 'conducting user interview', 'reviewing usability test', 'mapping user journey'],
  selly: ['pitching to enterprise client', 'updating sales pipeline', 'preparing demo deck', 'following up with lead'],
  stacky: ['scaling kubernetes cluster', 'monitoring CPU usage', 'updating CI/CD pipeline', 'configuring load balancer'],
  watchy: ['checking dashboard alerts', 'monitoring API latency', 'reviewing error rates', 'tracking uptime metrics'],
  guardy: ['running security scan', 'reviewing access permissions', 'patching vulnerability', 'updating firewall rules'],
  hiry: ['reviewing candidate resume', 'scheduling interview', 'writing job description', 'hosting culture chat'],
  evaly: ['preparing performance review', 'analyzing team metrics', 'writing feedback report', 'calibrating ratings'],
  quanty: ['backtesting alpha model', 'optimizing portfolio weights', 'running Monte Carlo sim', 'calibrating risk model'],
  tradey: ['executing market order', 'monitoring positions', 'adjusting stop-losses', 'scanning for opportunities'],
  globy: ['reading Fed minutes', 'analyzing GDP data', 'tracking forex movements', 'writing macro outlook'],
  fieldy: ['deep-diving semiconductor sector', 'analyzing earnings report', 'visiting company site', 'updating sector model'],
  hedgy: ['calculating portfolio VaR', 'adjusting hedge ratios', 'stress-testing scenarios', 'reviewing tail risks'],
  valuey: ['building DCF model', 'comparing peer multiples', 'estimating fair value', 'reviewing assumptions'],
  opsy: ['coordinating team schedules', 'optimizing workflows', 'managing vendor relations', 'updating operations dashboard'],
};

const meetingActivities = [
  'joined department standup',
  'presenting in team meeting',
  'brainstorming session',
  'cross-department sync',
  'weekly review meeting',
];

const elevatorActivities = [
  'heading to Chairman\'s office for report',
  'going to grab coffee at lobby',
  'visiting another department',
  'returning to desk',
];

export function getRandomActivity(agentId: string): string {
  const activities = workActivities[agentId];
  if (!activities) return 'working on tasks';
  return activities[Math.floor(Math.random() * activities.length)];
}

export function getRandomMeetingActivity(): string {
  return meetingActivities[Math.floor(Math.random() * meetingActivities.length)];
}

export function getRandomElevatorActivity(): string {
  return elevatorActivities[Math.floor(Math.random() * elevatorActivities.length)];
}

export type ActivityLogEntry = {
  id: string;
  agentId: string;
  agentName: string;
  activity: string;
  timestamp: number;
  floor: number;
};
