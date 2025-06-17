export const DEVICE_UUIDS = {
    SpectraDerma: {
      service: 0xACEF  ,
      characteristic: 0xFF01,
    },
    MIRAS: {
        service: 0xACEF,
        characteristic: 0xFF01,
      },
    HePPS: {
        service: 0x7A99,
        characteristic: 0xCF7A,
    },
    LaHMo2: {
      service: '12fb95d1-4954-450f-a82b-802f71541562',
      characteristic: "67136980-20d0-4711-8b37-3acd0fec8e7f",
    },
  } as const;
  
  export type KnownDeviceName = keyof typeof DEVICE_UUIDS;