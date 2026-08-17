import type { ApiPackage } from './packagesService'

// View model for the register-wizard package picker: what the buttons render
// (name + fee) plus the id sent as packageId on create.
export interface PackageOption {
  id:    string
  name:  string
  price: number
}

export function toPackageOption(row: ApiPackage): PackageOption {
  return {
    id:    row.id,
    name:  row.package_name,
    price: Number(row.total_fee),
  }
}
