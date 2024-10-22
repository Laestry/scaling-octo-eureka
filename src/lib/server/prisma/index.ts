import { PrismaClient, Prisma } from '@prisma/client-cache';
import * as PrismaTypes from '@prisma/client-cache';
import { pagination } from 'prisma-extension-pagination';
import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({
    override: true
});

export { PrismaTypes };
export type Product = PrismaTypes.Product;

export const prisma = new PrismaClient()
    .$extends(
        pagination({
            pages: {
                limit: 100,
                includePageCount: true
            }
        })
    )
    .$extends({
        model: {
            $allModels: {
                async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']) {
                    const context = Prisma.getExtensionContext(this);
                    const result = await (context as any).findFirst({
                        where,
                        select: {
                            id: true
                        }
                    });
                    return result !== null;
                }
            }
        }
    });
