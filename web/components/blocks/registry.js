"use client";

import PageHero from "@/components/blocks/PageHero";
import WorkshopList from "@/components/blocks/WorkshopList";
import CategoryGrid from "@/components/blocks/CategoryGrid";
import CityGrid from "@/components/blocks/CityGrid";
import VenueList from "@/components/blocks/VenueList";
import StepsRail from "@/components/blocks/StepsRail";
import ThresholdExplainer from "@/components/blocks/ThresholdExplainer";
import PilotBanner from "@/components/blocks/PilotBanner";
import FeatureSplit from "@/components/blocks/FeatureSplit";
import LinkCards from "@/components/blocks/LinkCards";
import ReviewList from "@/components/blocks/ReviewList";
import FaqList from "@/components/blocks/FaqList";
import PricingExample from "@/components/blocks/PricingExample";
import CancellationPolicy from "@/components/blocks/CancellationPolicy";
import FormBlock from "@/components/blocks/FormBlock";
import LinkColumns from "@/components/blocks/LinkColumns";
import CtaBand from "@/components/blocks/CtaBand";

/* Bloktypes uit wicked-workshops-export.json (zie lib/block-types.json).
   Los van BlockRenderer, zodat StaticPage ze ook kan gebruiken. */
export const BLOCKS = {
  page_hero: PageHero,
  workshop_list: WorkshopList,
  category_grid: CategoryGrid,
  city_grid: CityGrid,
  venue_list: VenueList,
  steps_rail: StepsRail,
  threshold_explainer: ThresholdExplainer,
  pilot_banner: PilotBanner,
  feature_split: FeatureSplit,
  link_cards: LinkCards,
  review_list: ReviewList,
  faq_list: FaqList,
  pricing_example: PricingExample,
  cancellation_policy: CancellationPolicy,
  form: FormBlock,
  link_columns: LinkColumns,
  cta_band: CtaBand,
};
