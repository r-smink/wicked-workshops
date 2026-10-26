/* Routes onder /dev bestaan alleen in ontwikkeling en in de tests
   (ENABLE_DEV_ROUTES=1). In productie geven ze 404. */
export function devRoutesEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_ROUTES === "1";
}
