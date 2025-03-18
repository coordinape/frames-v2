import JoinDirectoryButton from "./JoinDirectoryButton";

interface MembershipStatusProps {
  isMember: boolean;
  address?: string;
  username: string;
  basename?: string;
}

export default function MembershipStatus({ isMember, address, username, basename }: MembershipStatusProps) {
  return (
    <div className="inline-flex items-center">
      {isMember && (
        <svg className="h-5 w-5 mr-1.5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.5212 2.62368C11.3146 1.75255 12.6852 1.75255 13.4786 2.62368L14.4988 3.74391C14.8997 4.18418 15.476 4.42288 16.0709 4.39508L17.5844 4.32435C18.7613 4.26934 19.7306 5.23857 19.6756 6.41554L19.6048 7.92905C19.577 8.52388 19.8157 9.10016 20.256 9.50111L21.3762 10.5213C22.2474 11.3147 22.2474 12.6853 21.3762 13.4787L20.256 14.4989C19.8157 14.8998 19.577 15.4761 19.6048 16.071L19.6756 17.5845C19.7306 18.7614 18.7613 19.7307 17.5844 19.6757L16.0709 19.6049C15.476 19.5771 14.8997 19.8158 14.4988 20.2561L13.4786 21.3763C12.6852 22.2475 11.3146 22.2475 10.5212 21.3763L9.50099 20.2561C9.10004 19.8158 8.52376 19.5771 7.92893 19.6049L6.41541 19.6757C5.23845 19.7307 4.26922 18.7614 4.32423 17.5845L4.39496 16.071C4.42276 15.4761 4.18406 14.8998 3.74379 14.4989L2.62356 13.4787C1.75243 12.6853 1.75243 11.3147 2.62356 10.5213L3.74379 9.50111C4.18406 9.10016 4.42276 8.52388 4.39496 7.92905L4.32423 6.41553C4.26922 5.23857 5.23845 4.26934 6.41542 4.32435L7.92893 4.39508C8.52376 4.42288 9.10004 4.18418 9.50099 3.74391L10.5212 2.62368Z"
            stroke="white"
            strokeWidth="1.5"
          />
          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
