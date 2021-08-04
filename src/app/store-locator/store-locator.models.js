"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Miles;
(function (Miles) {
    Miles[Miles["tenMiles"] = 0] = "tenMiles";
    Miles[Miles["twentyFiveMiles"] = 1] = "twentyFiveMiles";
    Miles[Miles["fiftyMiles"] = 2] = "fiftyMiles";
    Miles[Miles["hundredMiles"] = 3] = "hundredMiles";
})(Miles = exports.Miles || (exports.Miles = {}));
var SearchType;
(function (SearchType) {
    SearchType[SearchType["addressCityZip"] = 0] = "addressCityZip";
    SearchType[SearchType["state"] = 1] = "state";
    SearchType[SearchType["currentLocation"] = 2] = "currentLocation";
})(SearchType = exports.SearchType || (exports.SearchType = {}));
var AddressCityZipSearchType;
(function (AddressCityZipSearchType) {
    AddressCityZipSearchType[AddressCityZipSearchType["zip"] = 0] = "zip";
    AddressCityZipSearchType[AddressCityZipSearchType["state"] = 1] = "state";
    AddressCityZipSearchType[AddressCityZipSearchType["address"] = 2] = "address";
    AddressCityZipSearchType[AddressCityZipSearchType["city"] = 3] = "city";
})(AddressCityZipSearchType = exports.AddressCityZipSearchType || (exports.AddressCityZipSearchType = {}));
//# sourceMappingURL=store-locator.models.js.map