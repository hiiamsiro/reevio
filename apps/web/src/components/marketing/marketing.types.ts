export interface GalleryItem {
  readonly title: string;
  readonly duration: string;
  readonly credits: string;
  readonly tone: string;
  readonly ratio: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
}

export interface WorkflowStep {
  readonly step: string;
  readonly title: string;
  readonly copy: string;
}

export interface MarketingPlan {
  readonly name: string;
  readonly price: string;
  readonly credits: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly featured?: boolean;
}

export interface GalleryCardProps {
  readonly item: GalleryItem;
  readonly toneIndex: number;
}

export interface WorkflowStepCardProps {
  readonly item: WorkflowStep;
}

export interface MarketingPlanCardProps {
  readonly plan: MarketingPlan;
}
