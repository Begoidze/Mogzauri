-- Drop shipping location fields that are no longer collected.
ALTER TABLE "Order"
DROP COLUMN "shippingCity",
DROP COLUMN "shippingCountry",
DROP COLUMN "shippingPostalCode";

-- Drop optional user profile location fields that are no longer collected.
ALTER TABLE "User"
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "postalCode";
