export const roles = {
  DHO: 'District Health Officer',
  BMO: 'Block Medical Officer',
  PHC_MO: 'PHC Medical Officer',
  DEO: 'PHC Data Entry Operator',
  ASHA: 'ASHA Worker',
} as const;

export type UserRole = keyof typeof roles;

export default roles;
