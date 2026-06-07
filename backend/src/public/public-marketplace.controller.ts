import { Controller, Get, Param, Query } from "@nestjs/common";
import { PublicMarketplaceService } from "./public-marketplace.service";

@Controller("public")
export class PublicMarketplaceController {
  constructor(private readonly marketplace: PublicMarketplaceService) {}

  @Get("home")
  async home() {
    return {
      success: true,
      data: await this.marketplace.home()
    };
  }

  @Get("cities")
  async cities() {
    return {
      success: true,
      data: await this.marketplace.listCities()
    };
  }

  @Get("cities/:slug")
  async city(@Param("slug") slug: string) {
    return {
      success: true,
      data: await this.marketplace.getCity(slug)
    };
  }

  @Get("activities")
  async activities(
    @Query("citySlug") citySlug?: string,
    @Query("categorySlug") categorySlug?: string,
    @Query("search") search?: string,
    @Query("limit") limit?: string
  ) {
    return {
      success: true,
      data: await this.marketplace.listActivities({ categorySlug, citySlug, limit, search })
    };
  }

  @Get("activities/:slug")
  async activity(@Param("slug") slug: string) {
    return {
      success: true,
      data: await this.marketplace.getActivity(slug)
    };
  }
}
