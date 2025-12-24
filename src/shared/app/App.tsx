import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, Layout } from "antd";
import ru_RU from "antd/locale/ru_RU";
import styles from "./App.module.scss";
import Header from "@/widgets/header/Header";
import Footer from "@/widgets/footer/Footer";
import AppRouter from "./router/AppRouter";

const App = () => {
  // Создаём клиент для TanStack Query, который управляет API-запросами, кешированием и синхронизацией данных.
  // retry: 1 - автоматически повторяет неудачные запросы 1 раз для повышения надёжности.
  // Без этого клиента запросы к API не будут работать корректно.
  // Создаю для будущего сервера

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={client}>
      {/* чуть позже можно будет добавить тему */}
      <ConfigProvider locale={ru_RU}>
        <Layout className={styles.layout}>
          <Header />
          <Layout.Content>
            <AppRouter />
          </Layout.Content>
          <Footer />
        </Layout>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
