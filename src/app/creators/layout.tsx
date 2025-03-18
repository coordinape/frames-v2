import Provider from "~/components/providers/WagmiProvider";
import LayoutWrapper from "~/app/components/LayoutWrapper";


const RootLayout = ({ children }: {children:React.ReactNode}) => {
  return (
      <Provider>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </Provider>
  );
}

export default RootLayout;