export class BookingHomePageLocators {
  static readonly HERO_TITLE = "h1";
  static readonly ROOMS_SECTION_HEADING = 'h2:has-text("Our Rooms")';
  static readonly AVAILABILITY_CARD =
    '.card:has(h3.card-title):has(button:has-text("Check Availability"))';
  static readonly ROOM_CARD_TITLE = "h5.card-title";
  static readonly ROOM_CARD_DESCRIPTION = "p.card-text";
  static readonly ROOM_CARD_FEATURE = ".badge";
}
