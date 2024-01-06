import {MemberData} from "../PageSearch/SearchOptions/reducer";
import {BillGroup, CustomAttribute, Population, SubsAffilExternalID} from "../Types";
import {blankMember} from "../__mocks__/membersMock";
import {fillArrays} from "../hooks/fillArraysV2";
import produce from "immer";

type SubList = BillGroup | Population | CustomAttribute;

const processSubsAffiliation = (state: MemberData) => {
    // @ts-ignore
    const {billGroupList: [blankBillGroup], populationList: [blankPopulation], memberCustomAttributeList: [blankAttribute]} = blankMember.memberDetail.memberAffiliationList[0];

    const isEqual = (a: SubList, b: SubList): boolean => a.effectiveDate === b.effectiveDate && a.contractOptType === b.contractOptType;

    const isBefore = (a: SubList, b: SubList | Population | CustomAttribute): boolean => {
        if (a.effectiveDate === b.effectiveDate) {
            return priority(a.contractOptType) > priority(b.contractOptType);
        } else {
            return a.effectiveDate > b.effectiveDate;
        }
    }

    const {billGroupList: sourceBillGroups, populationList: sourcePopulations, memberCustomAttributeList: sourceAttributes, subsAffiliationExternalIDList: sourceExtIds} = state.source.memberDetail.memberAffiliationList[0];
    const {billGroupList: targetBillGroups, populationList: targetPopulations, memberCustomAttributeList: targetAttributes, subsAffiliationExternalIDList: targetExtIds} = state.target.memberDetail.memberAffiliationList[0];

    const [sBillGroups, tBillGroups] = fillArrays<BillGroup>('billGroupList', [sourceBillGroups, targetBillGroups], blankBillGroup, isEqual, isBefore, [], [], true);
    const [sPopulations, tPopulations] = fillArrays<Population>('populationList', [sourcePopulations, targetPopulations], blankPopulation, isEqual, isBefore, [], [], true);
    const [sAttributes, tAttributes] = fillArrays<CustomAttribute>('memberCustomAttributeList', [sourceAttributes, targetAttributes], blankAttribute, isEqual, isBefore, [], [], true);

    return produce(state, (draft: MemberData) => {
        draft.source.memberDetail.memberAffiliationList[0] = {
            ...state.source.memberDetail.memberAffiliationList[0],
            billGroupList: sBillGroups,
            populationList: sPopulations,
            memberCustomAttributeList: sAttributes,
            subsAffiliationExternalIDList: sourceExtIds.map((id: SubsAffilExternalID) => ({...id, selectable: true, checked: false}))
        };
        draft.target.memberDetail.memberAffiliationList[0] = {
            ...state.target.memberDetail.memberAffiliationList[0],
            billGroupList: tBillGroups,
            populationList: tPopulations,
            memberCustomAttributeList: tAttributes,
            subsAffiliationExternalIDList: targetExtIds
        };
    });
}

export default processSubsAffiliation;

export const priority = (contractOptType: string) => {
    switch (contractOptType) {
        case "MD": return 15;   // Medical
        case "DN": return 14;   // Dental
        case "VS": return 13;   // Vision
        case "CS": return 12;   // Contraceptive Services Only
        case "LI": return 11;   // Life
        case "AD": return 10;   // Accidental Death and Dismemberment
        case "LD": return 9;    // Life and AD&D Combination
        case "SH": return 8;    // Supplemental Health
        case "SP": return 7;    // Spending Account
        case "DL": return 6;    // Disability - Long Term
        case "DS": return 5;    // Disability - Short Term
        case "HP": return 4;    // HIPP
        case "RX": return 3;    // Pharmacy
        case "SL": return 2;    // Supplemental Life (other)
        case "SA": return 1;    // Supplemental AD&D (other)
        default:   return 0;
    }
}
