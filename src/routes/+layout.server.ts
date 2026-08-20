import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
    const ageVerified = cookies.get('age_verified') === '1';

    if (safeGetSession) {
        const { session, user } = await safeGetSession();
        return {
            user,
            session,
            cookies: cookies.getAll(),
            ageVerified
        };
    }

    return { ageVerified };
};
