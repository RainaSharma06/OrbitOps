FROM node:22-alpine AS builder
WORKDIR /app
ENV DOCKER_BUILD=1
ENV NEXT_PUBLIC_API_URL="https://orbitops-api.onrender.com/api/v1"
ENV API_INTERNAL_URL="https://orbitops-api.onrender.com/api/v1"
RUN npm install -g pnpm@10.12.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL="https://orbitops-api.onrender.com/api/v1"
ENV API_INTERNAL_URL="https://orbitops-api.onrender.com/api/v1"

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Support both flat and nested monorepo standalone structures
RUN if [ -d "./apps/web" ]; then \
      mkdir -p ./apps/web/.next; \
      cp -rn ./.next/static ./apps/web/.next/ 2>/dev/null || true; \
    fi

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; elif [ -f apps/web/server.js ]; then node apps/web/server.js; else find . -maxdepth 3 -name 'server.js' -exec node {} +; fi"]
