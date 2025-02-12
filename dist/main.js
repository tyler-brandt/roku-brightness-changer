"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const network_1 = require("./network/network");
const path_1 = require("path");
async function bootstrap() {
    (0, network_1.GetRokuAddress)()
        .then(() => console.log('Roku address resolved'))
        .catch(console.error);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    app.enableCors();
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
//# sourceMappingURL=main.js.map