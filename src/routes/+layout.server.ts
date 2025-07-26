import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
    if (safeGetSession) {
        const { session, user } = await safeGetSession();
        return {
            user,
            session,
            cookies: cookies.getAll()
        };
    }
};
