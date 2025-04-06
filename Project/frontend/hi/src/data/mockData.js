
  export const students= [
    {
      id: '1',
      name: 'Rahul Kumar',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      publicationCount: 4,
      orcid: '0000-0002-1825-0097'
    },
    {
      id: '2',
      name: 'Priya Singh',
      profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      publicationCount: 3,
      orcid: '0000-0001-5909-4358'
    },
    {
      id: '3',
      name: 'Amit Patel',
      profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
      publicationCount: 2,
      orcid: '0000-0003-2413-5762'
    },
    {
      id: '4',
      name: 'Deepa Sharma',
      profileImage: 'https://randomuser.me/api/portraits/women/26.jpg',
      publicationCount: 5,
      orcid: '0000-0001-9742-3138'
    },
  ];
  
  export const publications = [
    {
      id: '1',
      title: 'Neural Networks for Medical Imaging: A Comprehensive Review',
      date: '2023-12-15',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Published',
      doi: '10.1234/journal.ai.2023.001',
      coAuthors: ['Dr. Mehta, A.', 'Dr. Shah, S.'],
      type:"q1",
      studentId: '2'
    },
    {
      id: '2',
      title: 'Deep Learning Applications in Genomic Research',
      date: '2023-10-05',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Published',
      doi: '10.1234/journal.bio.2023.145',
      coAuthors: ['Dr. Gupta, V.', 'Dr. Reddy, P.', 'Dr. Joshi, M.'],
      type:"q1",
      studentId: '1'
    },
    {
      id: '3',
      title: 'Efficient Transformer Models for Natural Language Processing',
      date: '2024-01-20',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Editorial Revised',
      doi: '10.1234/journal.nlp.2024.021',
      coAuthors: ['Dr. Singh, H.'],
      type:"q1",
      studentId: '1'
    },
    {
      id: '4',
      title: 'Computer Vision Techniques for Autonomous Vehicles',
      date: '2024-02-10',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Submitted',
      doi: '10.1234/journal.cv.2024.056',
      coAuthors: ['Dr. Choudhary, R.', 'Dr. Patel, S.'],
      type:"q1",
      studentId: '2'
    },
    {
      id: '5',
      title: 'Reinforcement Learning in Robotics: Recent Advancements',
      date: '2023-09-18',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Published',
      doi: '10.1234/journal.rob.2023.189',
      coAuthors: ['Dr. Kumar, A.', 'Dr. Nair, K.'],
      type:"q1",
      studentId: '3'
    },
    {
      id: '6',
      title: 'Quantum Computing Approaches for Optimization Problems',
      date: '2023-11-30',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Published',
      doi: '10.1234/journal.qc.2023.264',
      coAuthors: ['Dr. Iyer, S.', 'Dr. Das, M.'],
      type:"q1",
      studentId: '1'
    },
    {
      id: '7',
      title: 'Explainable AI: Methods and Applications',
      date: '2024-01-05',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Submitted',
      doi: '10.1234/journal.xai.2024.012',
      coAuthors: ['Dr. Banerjee, T.'],
      type:"q1",
      studentId: '3'
    },
    {
      id: '8',
      title: 'Data Privacy Techniques in Machine Learning',
      date: '2024-02-28',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Editorial Revised',
      doi: '10.1234/journal.dp.2024.073',
      coAuthors: ['Dr. Kapoor, N.', 'Dr. Ali, F.'],
      type:"q1",
      studentId: '1'
    },
    {
      id: '9',
      title: 'Federated Learning: Challenges and Solutions',
      date: '2023-08-12',
      journal:"IEEE Transactions on Medical Imaging",
      status: 'Published',
      doi: '10.1234/journal.fl.2023.128',
      coAuthors: ['Dr. Verma, P.', 'Dr. Mishra, R.'],
      type:"q1",
      studentId: '2'
    },
    {
      id: '10',
      title: 'Edge Computing for IoT Applications',
      date: '2024-03-10',
      journal:"Journal of Machine Learning Research",
      status: 'Submitted',
      doi: '10.1234/journal.iot.2024.089',
      coAuthors: ['Dr. Sen, A.', 'Dr. Roy, D.'],
      type:"q1",
      studentId: '4'
    },
    {
      id: '11',
      title: 'Advancements in Natural Language Generation',
      date: '2023-10-25',
      journal:"	Physical Review Letters",
      status: 'Published',
      doi: '10.1234/journal.nlg.2023.217',
      type:"q1",
      coAuthors: ['Dr. Malik, S.'],
      studentId: '4'
    },
    {
      id: '12',
      title: 'Secure Multi-party Computation for Healthcare Data',
      date: '2024-01-15',
      journal:"Renewable and Sustainable Energy Reviews",
      status: 'Editorial Revised',
      doi: '10.1234/journal.hc.2024.034',
      coAuthors: ['Dr. Chauhan, V.', 'Dr. Gandhi, P.'],
      type:"q1",
      studentId: '4'
    },
    {
      id: '13',
      title: 'Graph Neural Networks for Recommendation Systems',
      date: '2023-11-07',
      journal:"Physical Review Letters",
      status: 'Published',
      doi: '10.1234/journal.gnn.2023.193',
      coAuthors: ['Dr. Saxena, R.', 'Dr. Sharma, H.'],
      type:"q1",
      studentId: '4'
    },
    {
      id: '14',
      title: 'Time Series Forecasting using Deep Learning',
      date: '2024-02-18',
      journal:"Journal of Machine Learning Research",
      status: 'Submitted',
      doi: '10.1234/journal.ts.2024.065',
      
      coAuthors: ['Dr. Bhatia, M.'],
      type:"q1",
      studentId: '4'
    },
    {
      id: '15',
      title: 'Ethical Considerations in AI Development',
      date: '2023-12-03',
      journal:"Journal of Machine Learning Research",
      status: 'Published',
      doi: '10.1234/journal.ethics.2023.236',
      coAuthors: ['Dr. Chopra, A.', 'Dr. Ahmed, S.'],
      type:"q1",
      studentId: '4'
    }
  ];
  
  export const getStudentById = (id)=> {
    return students.find(student => student.id === id);
  };
  
  export const getPublicationsByStudentId = (studentId)=> {
    return publications.filter(publication => publication.studentId === studentId);
  };
  