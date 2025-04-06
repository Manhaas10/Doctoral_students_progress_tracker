import { cn } from '@/lib/utils';


const RequestStatus = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
        };
      case 'Rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
        };
      case 'Applied':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
        };
      case 'Pending':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
        };
    }
  };

  const { bg, text } = getStatusStyles();

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        bg,
        text,
        className
      )}
    >
      {status}
    </span>
  );
};

export default RequestStatus;
